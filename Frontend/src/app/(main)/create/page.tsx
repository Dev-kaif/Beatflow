import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SongPanel } from "../../../components/create/SongPanel";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TrackListFetcher from "@/components/create/trackListFetch";
import { db } from "@/server/db";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const noOfCredits = await db.user.findFirst({
    where: {
      id: session.user.id
    },
    select: {
      credits: true
    }
  });

  const noCreditStatus = (noOfCredits?.credits ?? 0) <= 0;


  return (
    <div className="flex h-[calc(97vh - 100px)] flex-col lg:flex-row">
      {/* Left Panel */}
      <aside className="bg-background z-10 w-full flex-none border-r lg:sticky lg:top-0 lg:h-screen lg:w-[380px]">
        <SongPanel noCreditStatus={noCreditStatus} />
      </aside>

      {/* Right Panel */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <TrackListFetcher />
        </Suspense>
      </main>
    </div>
  );

}