"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Upgrade from "../sidebar/Upgrade";

type NoCreditModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NoCreditModal({
  open,
  onClose,
}: NoCreditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>No credits left</DialogTitle>
          <DialogDescription>
            You have no credits remaining. Please buy more credits to continue Creating Songs.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
         <Upgrade/>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
