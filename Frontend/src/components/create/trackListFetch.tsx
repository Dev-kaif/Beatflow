"use server";

import { getPresignedUrl } from "@/actions/generation";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TrackList } from "./TrackList";

export default async function TrackListFetcher() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const songs = await db.song.findMany({
    where: {
      userId: session.user.id,
      storageStatus: "ACTIVE",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const songsWithThumbnail = await Promise.all(
    songs.map(async (song) => {
      const thumbnailUrl = song.thumbnailUrl
        ? await getPresignedUrl(song.thumbnailUrl)
        : null;

      return {
        ...song,
        playUrl: null,
        thumbnailUrl,
        createdByUserName: song.user.name,
      };
    }),
  );

  return <TrackList tracks={songsWithThumbnail} />;
}
