import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SongPanel } from "../../../components/create/SongPanel";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TrackListFetcher from "@/components/create/trackListFetch";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <SongPanel />
      <div className="h-full flex-1">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <TrackListFetcher />
        </Suspense>
      </div>
    </div>
  );
}
