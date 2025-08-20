"use client";

import { authClient } from "@/lib/auth-client";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { SocialProviderListEnum } from "better-auth/social-providers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(...args) => router.push(...args)}
      replace={(...args) => router.replace(...args)}
      onSessionChange={() => {
        router.refresh();
      }}
      Link={Link}
      social={{
        providers: ["google", "github"],
      }}
    >
      {children}
    </AuthUIProvider>
  );
}
