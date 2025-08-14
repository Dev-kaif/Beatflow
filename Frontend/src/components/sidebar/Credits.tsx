"use server";

import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";

export async function Credits() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      credits: true,
    },
  });

  return (
    <div className="flex w-max items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 shadow-sm dark:bg-gray-800">
      <span className="text-lg font-semibold text-gray-900 dark:text-white">
        {user.credits}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400">Credits</span>
    </div>
  );
}
