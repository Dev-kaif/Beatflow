"use server";

import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";
import { headers } from "next/headers";
import { PassThrough, Readable } from "stream";
import { spawn } from "child_process";
import { Upload } from "@aws-sdk/lib-storage";

export interface GenerateRequest {
  prompt?: string;
  lyrics?: string;
  fullDescribedSong?: string;
  describedLyrics?: string;
  instrumental?: boolean;
}

type SongWithUser = {
  s3Key: string;
  user: { id: string; package: Package } | null;
};

type Package = "free" | "starter" | "creator";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.AWS_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY_ID,
  },
});

/* ------------------ Song Generation ------------------ */
export async function generateSong(generateRequest: GenerateRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  await queueSong(generateRequest, 15, session.user.id);
  revalidatePath("/create");
}

export async function queueSong(
  generateRequest: GenerateRequest,
  guidanceScale: number,
  userId: string,
) {
  const song = await db.song.create({
    data: {
      userId,
      prompt: generateRequest.prompt,
      lyrics: generateRequest.lyrics,
      describedLyrics: generateRequest.describedLyrics,
      fullDescribedSong: generateRequest.fullDescribedSong,
      instrumental: generateRequest.instrumental,
      guidanceScale,
      audioDuration: 180,
    },
  });

  await inngest.send({
    name: "song-event",
    data: { songId: song.id, userId: song.userId },
  });
}

/* ------------------ S3 Helpers ------------------ */
export async function getPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function getObject(key: string): Promise<Readable> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);

  if (!response.Body || !(response.Body instanceof Readable)) {
    throw new Error("Failed to fetch object or not a Readable stream");
  }

  return response.Body;
}

export async function uploadTempObject(
  key: string,
  body: Readable,
  contentType = "audio/mpeg",
  expiresInDays = 7,
): Promise<void> {
  try {
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expiresInDays);

    const pass = new PassThrough();
    body.pipe(pass);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const upload = new (Upload as new (options: unknown) => Upload)({
      client: s3,
      params: {
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: pass,
        ContentType: contentType,
        Metadata: {
          expireat: expireAt.toISOString(),
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await upload.done();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("S3 upload failed:", error.message, error.stack);
      throw error;
    } else {
      console.error("S3 upload failed with an unknown error object:", error);
      throw new Error(
        `An unknown error occurred during S3 upload: ${String(error)}`,
      );
    }
  }
}
async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(
      new HeadObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key }),
    );
    return true;
  } catch {
    return false;
  }
}

/* ------------------ FFmpeg Helpers ------------------ */
async function transcodeAndUpload({
  srcKey,
  dstKey,
  args,
}: {
  srcKey: string;
  dstKey: string;
  args: string[];
}) {
  if (await objectExists(dstKey)) {
    return getPresignedUrl(dstKey);
  }

  const wavStream: Readable = await getObject(srcKey);

  return new Promise<string>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", ["-y", "-i", "pipe:0", ...args, "pipe:1"]);
    const pass = new PassThrough();

    wavStream.pipe(ffmpeg.stdin);

    ffmpeg.stdout.pipe(pass);

    ffmpeg.stderr.on("data", (chunk) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      console.error("ffmpeg:", chunk.toString());
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    uploadTempObject(dstKey, pass)
      .then(async () => {
        resolve(await getPresignedUrl(dstKey));
      })
      .catch(reject);
  });
}

/* ------------------ Playback + Preview ------------------ */
export async function getPlayUrl(songId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  const song = (await db.song.findFirst({
    where: {
      id: songId,
      OR: [{ userId: session.user.id }, { published: true }],
      s3Key: { not: null },
    },
    select: {
      id: true,
      s3Key: true,
      user: { select: { id: true, package: true } },
    },
  })) as SongWithUser;

  if (!song) throw new Error("Song not found or not accessible");

  // bump listen count
  await db.song.update({
    where: { id: songId },
    data: { listenCount: { increment: 1 } },
  });

  const userPackage = song.user?.package ?? "free";
  const isOwner = session.user.id === song.user?.id;

  if (userPackage === "free") {
    const mp3Key = song.s3Key.replace(/\.wav$/, ".mp3");
    return transcodeAndUpload({
      srcKey: song.s3Key,
      dstKey: mp3Key,
      args: ["-f", "mp3", "-b:a", "192k"],
    });
  }

  if (userPackage === "starter") {
    if (isOwner) {
      // starter users get full WAV for own songs
      return getPresignedUrl(song.s3Key);
    } else {
      // others' published songs → full MP3
      const mp3Key = song.s3Key.replace(/\.wav$/, ".mp3");
      return transcodeAndUpload({
        srcKey: song.s3Key,
        dstKey: mp3Key,
        args: ["-f", "mp3", "-b:a", "192k"],
      });
    }
  }

  if (userPackage === "creator") {
    // creator users → always full WAV
    return getPresignedUrl(song.s3Key);
  }
}

export async function getDownloadUrl(songId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  const song = await db.song.findFirst({
    where: {
      id: songId,
      OR: [{ userId: session.user.id }, { published: true }],
      s3Key: { not: null },
    },
    select: {
      id: true,
      s3Key: true,
      userId: true,
      published: true,
      user: { select: { package: true } },
    },
  });

  if (!song) throw new Error("Song not found or not accessible");

  const isOwner = song.userId === session.user.id;
  const userPackage = song.user?.package ?? "free";

  // Free package
  if (userPackage === "free") {
    if (isOwner) {
      // full mp3 of their own
      const mp3Key = song.s3Key?.replace(/\.wav$/, ".mp3");
      return transcodeAndUpload({
        srcKey: song.s3Key!,
        dstKey: mp3Key!,
        args: ["-f", "mp3", "-b:a", "192k"],
      });
    } else {
      // 30s preview
      const previewKey = song.s3Key?.replace(/\.wav$/, "-30s-preview.mp3");
      return transcodeAndUpload({
        srcKey: song.s3Key!,
        dstKey: previewKey!,
        args: ["-t", "30", "-f", "mp3", "-b:a", "128k"],
      });
    }
  }

  // Starter package
  if (userPackage === "starter") {
    if (isOwner) {
      // own = wav
      return getPresignedUrlForDownload(song.s3Key!);
    } else {
      // others published = mp3
      const mp3Key = song.s3Key?.replace(/\.wav$/, ".mp3");
      return transcodeAndUpload({
        srcKey: song.s3Key!,
        dstKey: mp3Key!,
        args: ["-f", "mp3", "-b:a", "192k"],
      });
    }
  }

  // Creator package
  if (userPackage === "creator") {
    // wav for both owner + published
    return getPresignedUrlForDownload(song.s3Key!);
  }

  throw new Error("Unsupported package type");
}

export async function getPresignedUrlForDownload(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
