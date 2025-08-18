import AppSidebarWrapper from "@/components/sidebar/AppSidebarWrapper";
import BreadcrumbPageClient from "@/components/sidebar/breadcrumb-page-client";
import SoundBar from "@/components/SoundBar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebarWrapper />
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
        <main className="flex-1 pb-20">{children}</main>
        <div className="fixed right-0 bottom-0 left-0 z-20 lg:left-64">
          <SoundBar />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
