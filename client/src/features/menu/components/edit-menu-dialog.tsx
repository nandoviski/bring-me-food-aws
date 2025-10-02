"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddMenuForm from "./add-menu-form";
import type { Menu } from "@/features/menu/schema/menu";

interface EditMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMenuUpdated?: () => void;
  menu: Menu;
}

export default function EditMenuDialog({
  open,
  onOpenChange,
  onMenuUpdated,
  menu,
}: EditMenuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Menu</DialogTitle>
          <DialogDescription>Update your menu details below.</DialogDescription>
        </DialogHeader>

        <AddMenuForm
          onOpenChange={onOpenChange}
          onMenuAdded={onMenuUpdated}
          initialData={{
            ...menu,
            meals: menu.meals
              .map((m) => m.id)
              .filter((id): id is string => typeof id === "string"),
          }}
          menuId={menu.id}
        />
      </DialogContent>
    </Dialog>
  );
}
