import type { Meal } from "@/features/meal/schema/meal";
import { z } from "zod";

export interface Menu {
  id: string;
  name: string;
  chefId: string;
  description: string;
  startDate: Date;
  endDate: Date;
  orderFrom?: Date;
  orderTo?: Date;
  createdAt: Date;
  updatedAt: Date;
  meals: Meal[];
}

export interface CreateEditMenu {
  id: string;
  name: string;
  chefId: string;
  description: string;
  startDate: Date;
  endDate: Date;
  orderFrom?: Date;
  orderTo?: Date;
  createdAt: Date;
  updatedAt: Date;
  meals: string[];
}

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
