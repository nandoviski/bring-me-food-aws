import { z } from "zod";

export type EditMealType = z.infer<typeof EditMealSchema>;
export const EditMealSchema = z.object({
  name: z.string().min(2, "Meal name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z
    .string()
    .refine(
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

// export const coco2: z.ZodType<Prisma.MealCreateWithoutChefInput> = z.object({
//   id: z.string().optional(),
//   name: z.string(),
//   description: z.string(),
//   price: z.number(),
//   image: z.string().optional(),
//   ingredients: z.string().optional(),
//   allergens: z.string().optional(),
//   createdAt: z.date().optional(),
//   updatedAt: z.date().optional(),
//   chefId: z.string().optional(),
//   // menus?: Prisma.MenuCreateNestedManyWithoutMealsInput;
//   // mealsOnOrders?: Prisma.MealsOnOrdersCreateNestedManyWithoutMealInput;
// });
