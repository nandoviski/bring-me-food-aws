import { z } from "zod";
import type { Meal } from "./meal";

/**
 * Menu - Full menu with meal objects
 * Used when displaying menu details
 */
export interface Menu {
  id: string;
  name: string;
  chefId: string;
  description: string;
  startDate: Date;
  endDate: Date;
  orderFrom?: Date;
  orderTo?: Date;
  distributedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  meals: Meal[];
}

/**
 * MenuCreate - Form input for creating/editing menus
 * Meal IDs are sent to API, not full meal objects
 */
export const menuSchema = z.object({
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

export type MenuCreate = z.infer<typeof menuSchema>;

// Backwards compatibility aliases
export const EditMenuSchema = menuSchema;
export type EditMenuType = MenuCreate;
export type CreateEditMenu = MenuCreate;
