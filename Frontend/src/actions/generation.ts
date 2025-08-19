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

export interface GenerateRequest {
  prompt?: string;
  lyrics?: string;
  fullDescribedSong?: string;
  describedLyrics?: string;
  instrumental?: boolean;
}

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

// ------------------ NEW: Audio Worker Communication ------------------
// This new helper function replaces all the local FFmpeg logic.
// Define the shape of the error response from your worker
interface WorkerErrorResponse {
  details?: string;
}

async function processAudioOnWorker({
  task,
  songKey,
  outputKey,
  params,
}: {
  task: "CONVERT_TO_MP3" | "CREATE_PREVIEW";
  songKey: string;
  outputKey: string;
  params?: Record<string, unknown>;
}) {
  if (await objectExists(outputKey)) {
    return getPresignedUrl(outputKey);
  }

  const workerUrl = `${env.NODE_BACKEND_URL}/process-audio`;
  console.log(`Sending task "${task}" to audio worker for ${songKey}`);

  const response = await fetch(workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      "x-api-key": env.AUDIO_WORKER_API_KEY, // This is now fully typed!
    },
    body: JSON.stringify({
      task,
      songKey,
      outputKey,
      params,
    }),
  });

  if (!response.ok) {
    // Assert the type of the JSON body
    const errorBody = (await response.json()) as WorkerErrorResponse;
    throw new Error(
      `Audio worker failed: ${errorBody.details ?? response.statusText}`,
    );
  }

  return getPresignedUrl(outputKey);
}

/* ------------------ Playback + Preview ------------------ */
export async function getPlayUrl(songId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const song = await db.song.findFirst({
    where: {
      id: songId,
      OR: [{ userId: session.user.id }, { published: true }],
      s3Key: { not: null },
    },
    select: { id: true, s3Key: true, userId: true },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { package: true },
  });

  if (!song?.s3Key) throw new Error("Song not found or not accessible");

  await db.song.update({
    where: { id: songId },
    data: { listenCount: { increment: 1 } },
  });

  const userPackage = user?.package ?? "free";
  const isOwner = session.user.id === song.userId;

  if (userPackage === "creator" || (userPackage === "starter" && isOwner)) {
    // These users get the full original WAV file
    return getPresignedUrl(song.s3Key);
  } else {
    // All other users get an MP3. Let the worker handle the conversion.
    const mp3Key = song.s3Key.replace(/\.wav$/, ".mp3");
    return processAudioOnWorker({
      task: "CONVERT_TO_MP3",
      songKey: song.s3Key,
      outputKey: mp3Key,
      params: { bitrate: "192k" },
    });
  }
}

export async function getDownloadUrl(songId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const song = await db.song.findFirst({
    where: {
      id: songId,
      OR: [{ userId: session.user.id }, { published: true }],
      s3Key: { not: null },
    },
    select: { id: true, s3Key: true, userId: true, published: true },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { package: true },
  });

  if (!song?.s3Key) throw new Error("Song not found or not accessible");

  const isOwner = song.userId === session.user.id;
  const userPackage = user?.package ?? "free";

  // Creator users always get the original WAV
  if (userPackage === "creator") {
    return getPresignedUrlForDownload(song.s3Key);
  }

  // Starter users get WAV for their own songs, MP3 for others
  if (userPackage === "starter") {
    if (isOwner) {
      return getPresignedUrlForDownload(song.s3Key);
    } else {
      const mp3Key = song.s3Key.replace(/\.wav$/, ".mp3");
      return processAudioOnWorker({
        task: "CONVERT_TO_MP3",
        songKey: song.s3Key,
        outputKey: mp3Key,
        params: { bitrate: "192k" },
      });
    }
  }

  // Free users get MP3 for their own, or a watermarked preview for others
  if (userPackage === "free") {
    if (isOwner) {
      const mp3Key = song.s3Key.replace(/\.wav$/, ".mp3");
      return processAudioOnWorker({
        task: "CONVERT_TO_MP3",
        songKey: song.s3Key,
        outputKey: mp3Key,
        params: { bitrate: "192k" },
      });
    } else {
      const previewKey = song.s3Key.replace(/\.wav$/, "-preview.mp3");
      return processAudioOnWorker({
        task: "CREATE_PREVIEW",
        songKey: song.s3Key,
        outputKey: previewKey,
        params: { duration: 30, bitrate: "128k" },
      });
    }
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
