import AboutPage from "@/components/About";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <nav className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur-lg mb-10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              className="h-12 w-auto sm:h-14 lg:h-20"
              alt="Beatflow logo"
              src="/mainLogo.png"
              width={200}
              height={80}
              priority
            />
          </Link>
        </div>
      </nav>

      <main className="mt-20">
        <AboutPage />
      </main>

      <footer className="bg-secondary/50 border-t px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-muted-foreground mx-auto max-w-7xl text-center text-sm">
          © {new Date().getFullYear()} Beatflow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
