import { z } from "zod";

export interface Meal {
  id?: string;
  name: string;
  chefId: string;
  description: string;
  price: number;
  size?: number;
  image?: string;
  ingredients: string[];
  allergens: string[];
  stockLimit?: number | null;   // Chef-set portion limit (null = unlimited)
  soldCount?: number | null;    // Current sold portions (active/confirmed orders)
  remainingStock?: number | null; // stockLimit - soldCount (null if no limit)
  createdAt?: Date;
  updatedAt?: Date;
}

export const mealSchema = z.object({
  name: z.string().min(2, "Meal name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine(
    (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
    {
      message: "Price must be a positive number",
    },
  ),
  size: z.string().optional(),
  ingredients: z.array(
    z.object({
      value: z.string(),
    }),
  ),
  allergens: z.array(
    z.object({
      value: z.string(),
    }),
  ),
  image: z.string().optional(),
});

export type MealCreate = z.infer<typeof mealSchema>;

// Backwards compatibility alias
export const EditMealSchema = mealSchema;
export type EditMealType = MealCreate;
