// AppSidebarWrapper.tsx (server)
import { AppSidebar } from "./AppSidebar";
import { Credits } from "./Credits";

export default function AppSidebarWrapper() {
  return <AppSidebar credits={<Credits />} />;
}
