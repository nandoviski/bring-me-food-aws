"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddMenuForm from "./add-menu-form";

interface AddMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMenuAdded?: () => void;
}

export default function AddMenuDialog({
  open,
  onOpenChange,
  onMenuAdded,
}: AddMenuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Menu</DialogTitle>
          <DialogDescription>
            Create a new weekly menu by selecting meals and setting a date
            range.
          </DialogDescription>
        </DialogHeader>

        <AddMenuForm onOpenChange={onOpenChange} onMenuAdded={onMenuAdded} />
      </DialogContent>
    </Dialog>
  );
}
