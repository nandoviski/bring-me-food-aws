"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuWithMeals } from "../schema/menu";
import AddMenuForm from "./add-menu-form";

interface EditMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMenuUpdated?: () => void;
  menu: MenuWithMeals;
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
            name: menu.name,
            description: menu.description,
            startDate: menu.startDate,
            endDate: menu.endDate,
            orderFrom: menu.orderFrom ?? undefined,
            orderTo: menu.orderTo ?? undefined,
            meals: menu.meals.map((m) => m.id),
          }}
          menuId={menu.id}
        />
      </DialogContent>
    </Dialog>
  );
}
