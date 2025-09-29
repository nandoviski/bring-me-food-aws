"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Meal } from "@/state/apiTypes";
import AddMealForm from "./add-meal-form";

interface EditMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealUpdated?: () => void;
  meal: Meal;
}

export default function EditMealDialog({
  open,
  onOpenChange,
  onMealUpdated,
  meal,
}: EditMealDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Meal</DialogTitle>
          <DialogDescription>Update your meal details below.</DialogDescription>
        </DialogHeader>

        <AddMealForm
          onOpenChange={onOpenChange}
          onMealAdded={onMealUpdated}
          initialData={{
            name: meal.name,
            description: meal.description,
            price: meal.price.toString(),
            size: meal.size?.toString(),
            image: meal.image ?? undefined,
            ingredients: meal.ingredients.map((i) => ({ value: i })),
            allergens: meal.allergens.map((a) => ({ value: a })),
          }}
          mealId={meal.id}
        />
      </DialogContent>
    </Dialog>
  );
}
