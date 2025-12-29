"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
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

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};


export function AppSidebar({
  credits,
  UserButton,
  creditsCount,
}: {
  credits: React.ReactNode;
  creditsCount?: number;
  UserButton: React.ReactNode;
}) {
  const showSaleBanner =
    typeof creditsCount === "number" ? creditsCount <= 1 : true;

  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <Sidebar>
        <SidebarHeader>
          <motion.div className="mt-6 mb-10" variants={itemVariants}>
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
          <motion.ul className="space-y-2" variants={listVariants}>
            <SidebarMenuItems />
          </motion.ul>
        </SidebarContent>

        <SidebarFooter>
          <motion.div
            variants={itemVariants}
            className="mb-3 rounded-xl border border-pink-200 bg-gradient-to-r from-orange-50 to-pink-50 p-4 text-xs"
          >
            <p className="text-sm font-semibold text-neutral-900">
              ✨ Get more credits
            </p>

            <p className="mt-1 text-xs text-neutral-600">
              Choose a pack and{" "}
              <span className="font-medium text-orange-600">
                keep creating
              </span>
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span className="text-neutral-700">
                  Starter · 5 credits
                </span>
                <span className="font-semibold text-neutral-900">$2</span>
              </div>

              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span className="text-neutral-700">
                  Creator · 15 credits
                </span>
                <span className="font-semibold text-neutral-900">$5</span>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs text-neutral-500">
              Use{" "}
              <span className="font-medium text-orange-600">
                Upgrade
              </span>{" "}
              below
              <span className="text-orange-500">↓</span>
            </p>

          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-3 flex w-full items-center gap-1 text-xs"
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


