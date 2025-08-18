import LandingPage from "@/components/LandingPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  // Fetch session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Pass the session status as a prop to the client component
  return <LandingPage isSessionActive={!!session} />;
}
