import { z } from "zod";

// Base schema for validation
export const MealBaseSchema = z.object({
  name: z.string().min(2, "Meal name must be at least 2 characters").max(150),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(250),
  price: z.number().positive("Price must be a positive number"),
  size: z.number().optional(),
  image: z.string().optional(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()),
});

// Create schema (no ID)
export const CreateMealSchema = MealBaseSchema.extend({
  chefId: z.string().uuid("Invalid chef ID"),
});

// Update schema (all fields optional)
export const UpdateMealSchema = MealBaseSchema.partial().extend({
  chefId: z.string().uuid().optional(),
});

// Full meal with database fields
export const MealSchema = MealBaseSchema.extend({
  id: z.string().uuid(),
  chefId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type Meal = z.infer<typeof MealSchema>;
export type CreateMeal = z.infer<typeof CreateMealSchema>;
export type UpdateMeal = z.infer<typeof UpdateMealSchema>;
