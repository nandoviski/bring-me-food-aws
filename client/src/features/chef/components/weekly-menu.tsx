"use client";

import { type Meal } from "@/features/meal/schema/meal";
import MealItem from "./meal-item";

type WeeklyMenuProps = {
  meals: Meal[];
};

export function WeeklyMenu({ meals }: WeeklyMenuProps) {
  // const [quantities, setQuantities] = useState<Record<string, number>>({});
  // const user = { name: "GET from clerk", email: "" };
  // const { toast } = useToast();

  if (meals.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No menu available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {meals?.map((meal) => (
          <MealItem key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
}
