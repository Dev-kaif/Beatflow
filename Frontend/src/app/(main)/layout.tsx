import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import BreadcrumbPageClient from "@/components/sidebar/breadcrumb-page-client";
import SoundBar from "@/components/SoundBar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Music Generator",
  description: "Generate music with AI",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} text-black`}>
      <Providers>
        <body>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="relative flex h-screen flex-col">
              <header className="bg-background sticky top-0 z-50 border-b px-4 py-2">
                <div className="flex shrink-0 grow items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPageClient />
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <div className="absolute right-0 bottom-0 left-0 z-20">
                <SoundBar />
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
