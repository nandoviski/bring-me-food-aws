"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddMealForm from "./add-meal-form";

interface AddMealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded?: () => void;
}

export default function AddMealDialog({
  open,
  onOpenChange,
  onMealAdded,
}: AddMealFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Meal</DialogTitle>
          <DialogDescription>
            Create a new meal to add to your offerings. Fill out the details
            below.
          </DialogDescription>
        </DialogHeader>

        <AddMealForm onOpenChange={onOpenChange} onMealAdded={onMealAdded} />
      </DialogContent>
    </Dialog>
  );
}
