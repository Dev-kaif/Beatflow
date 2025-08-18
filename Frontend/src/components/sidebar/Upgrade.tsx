"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
export default function Upgrade() {
  const handleUpgrade = async () => {
    await authClient.checkout({
      products: [
        process.env.NEXT_PUBLIC_PRODUCT_ID_MIN!,
        process.env.NEXT_PUBLIC_PRODUCT_ID_MID!,
        process.env.NEXT_PUBLIC_PRODUCT_ID_MAX!,
      ],
    });
  };

  return (
    <Button
      className="ml-2 cursor-pointer text-orange-500"
      variant={"outline"}
      size={"sm"}
      onClick={handleUpgrade}
    >
      Upgrade
    </Button>
  );
}
