import { getPresignedUrl } from "@/actions/generation";
import LandingPage from "@/components/LandingPage";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";

export default async function Page() {
  // Fetch session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const songs = await db.song.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      categories: true,
      likes: true,
    },
    take: 20,
  });

  const popularSongs = songs
    .sort((a, b) => b._count.likes - a._count.likes)
    .slice(0, 3);

  const songsWithUrl = await Promise.all(
    popularSongs.map(async (song) => {
      const thumbnailUrl = song.thumbnailUrl
        ? await getPresignedUrl(song.thumbnailUrl)
        : null;
      return { ...song, thumbnailUrl };
    }),
  );

  // Pass the session status as a prop to the client component
  return <LandingPage songs={songsWithUrl} isSessionActive={!!session} />;
}
