import { z } from "zod";

// Base schema for validation
export const MenuBaseSchema = z.object({
  name: z.string().min(2, "Menu name must be at least 2 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(250),
  startDate: z.date("Start date must be a valid date"),
  endDate: z.date("End date must be a valid date"),
  orderFrom: z.date().optional(),
  orderTo: z.date().optional(),
});

// Create schema
export const CreateMenuSchema = MenuBaseSchema.extend({
  chefId: z.string().uuid("Invalid chef ID"),
  meals: z.array(z.string().uuid("Invalid meal ID")).optional().default([]),
});

// Update schema (all fields optional)
export const UpdateMenuSchema = MenuBaseSchema.partial().extend({
  meals: z.array(z.string().uuid("Invalid meal ID")).optional(),
});

// Full menu with database fields
export const MenuSchema = MenuBaseSchema.extend({
  id: z.string().uuid(),
  chefId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type Menu = z.infer<typeof MenuSchema>;
export type CreateMenu = z.infer<typeof CreateMenuSchema>;
export type UpdateMenu = z.infer<typeof UpdateMenuSchema>;
