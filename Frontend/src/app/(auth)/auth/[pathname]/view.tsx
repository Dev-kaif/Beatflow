"use client";

import { Button } from "@/components/ui/button";
import { AuthCard } from "@daveyplate/better-auth-ui";
import { ArrowLeft, Link } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function AuthView({ pathname }: { pathname: string }) {
  const router = useRouter();
  return (
    <main className="bg-background flex min-h-svh flex-col">
      <div className="container flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
        <motion.nav className="fixed top-0 z-50 w-full transition-colors duration-300">
          <div className="mx-auto h-20 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-full items-center justify-between border-b border-transparent transition-colors duration-300">
              <Image
                className="h-12 w-auto sm:h-14 lg:h-20"
                alt="Beatflow logo"
                src="/mainLogo.png"
                width={160}
                height={64}
                priority
              />
              <Button
                variant={"link"}
                onClick={() => router.back()}
                className="flex items-center space-x-1 text-gray-700 hover:scale-[1.05] hover:text-black"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
          </div>
        </motion.nav>
        <div className="mt-20 w-full flex justify-center items-center">
          <AuthCard pathname={pathname} />
        </div>
      </div>
    </main>
  );
}
