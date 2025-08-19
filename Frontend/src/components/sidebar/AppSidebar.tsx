"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import SidebarMenuItems from "./sidebar-menu-items";
import Upgrade from "./Upgrade";
import type React from "react";

const sidebarVariants: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function AppSidebar({
  credits,
  UserButton,
}: {
  credits: React.ReactNode;
  UserButton: React.ReactNode;
}) {
  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <Sidebar>
        <SidebarHeader>
          <motion.div className="mt-15 mb-20" variants={itemVariants}>
            <Image
              alt="Beatflow logo"
              src="/mainLogo.png"
              width={140}
              height={56}
              priority
            />
          </motion.div>
        </SidebarHeader>

        <SidebarContent>
          <motion.ul className="space-y-2">
            <SidebarMenuItems />
          </motion.ul>
        </SidebarContent>

        <SidebarFooter>
          <motion.div
            variants={itemVariants}
            className="mb-4 flex w-full items-center gap-1 text-xs"
          >
            {credits}
            <Upgrade />
          </motion.div>
          <motion.div variants={itemVariants}>{UserButton}</motion.div>
        </SidebarFooter>
      </Sidebar>
    </motion.div>
  );
}
