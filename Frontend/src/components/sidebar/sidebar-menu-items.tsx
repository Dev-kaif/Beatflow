"use client";

import { Home, Music } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { motion, type Variants } from "motion/react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function SidebarMenuItems() {
  const path = usePathname();

  let items = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
      active: false,
    },
    {
      title: "Create",
      url: "/create",
      icon: Music,
      active: false,
    },
  ];

  items = items.map((item) => ({
    ...item,
    active: path === item.url,
  }));

  return (
    <>
      {items.map((item) => (
        <motion.div
          key={item.title}
          variants={itemVariants}
          className="list-none"
        >
          <SidebarMenuItem className="relative">
            {path === item.url && (
              <motion.div
                layoutId="active-sidebar-item"
                className="absolute inset-0 z-0 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <SidebarMenuButton
              variant={"default"}
              asChild
              className={`relative z-10 ${path === item.url ? "text-white" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
            >
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </motion.div>
      ))}
    </>
  );
}
