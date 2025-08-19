// AppSidebarWrapper.tsx (server)
import { UserButton } from "@daveyplate/better-auth-ui";
import { AppSidebar } from "./AppSidebar";
import { Credits } from "./Credits";

export default function AppSidebarWrapper() {
  return (
    <AppSidebar
      UserButton={<UserButton variant="outline" />}
      credits={<Credits />}
    />
  );
}
