import type { Meal, Menu, Prisma } from "@prisma/client";
import { z } from "zod";

// export type MealsOnMenusWithMeal = MealsOnMenus & {
//   meal: Meal;
// };

// export type MenuWithMeals = Menu & {
//   meals: MealsOnMenusWithMeal[];
// };

export type MenuWithMeals = Prisma.MenuGetPayload<{
  include: {
    meals: true;
  };
}>;

export type EditMenuType = z.infer<typeof EditMenuSchema>;
export const EditMenuSchema = z.object({
  name: z.string().min(2, "Menu name must be at least 2 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(250),
  startDate: z.date(),
  endDate: z.date(),
  orderFrom: z.date().optional(),
  orderTo: z.date().optional(),
  meals: z.array(z.string()), // Array of meal IDs
});
