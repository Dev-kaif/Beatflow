"use server";

import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function setPublishedStatus(
  songId: string,
  published: boolean,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  await db.song.update({
    where: { id: songId, userId: session.user.id },
    data: { published },
  });

  revalidatePath("/create");
}

export async function renameSong(songId: string, newTitle: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  await db.song.update({
    where: { id: songId, userId: session.user.id },
    data: {
      title: newTitle,
    },
  });

  revalidatePath("/create");
}

export async function deleteSong(songId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  await db.song.delete({
    where: { id: songId, userId: session.user.id },
  });

  revalidatePath("/create");
}
