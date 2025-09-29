"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddMealDialog from "./add-meal-dialog";

interface AddMealButtonProps {
  onMealAdded?: () => void;
}

export default function AddMealButton({ onMealAdded }: AddMealButtonProps) {
  const [addMealOpen, setAddMealOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-orange-500 hover:bg-orange-600"
        onClick={() => setAddMealOpen(true)}
      >
        Add New Meal
      </Button>
      <AddMealDialog
        open={addMealOpen}
        onOpenChange={setAddMealOpen}
        onMealAdded={onMealAdded}
      />
    </>
  );
}
