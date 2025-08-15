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
    <div className="flex flex-col lg:flex-row">
      <div className="bg-background sticky top-0 z-10 w-full flex-none lg:w-1/4">
        <SongPanel />
      </div>
      <div className="h-[calc(97vh-100px)] flex-1 overflow-y-auto [mask-image:linear-gradient(to_bottom,white,white_90%,transparent)] [mask-size:100%_100%] [mask-position:0_20px] [mask-repeat:no-repeat]">
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
