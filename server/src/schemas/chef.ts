import { z } from "zod";

// Base schema for validation
export const ChefBaseSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(200)
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  location: z.string().min(2, "Location must be at least 2 characters").max(150),
  bio: z.string().max(500).optional(),
  specialties: z.string().max(250).optional(),
  phoneNumber: z.string().max(20).optional(),
});

// Create schema
export const CreateChefSchema = ChefBaseSchema.extend({
  userId: z.string().uuid("Invalid user ID"),
});

// Update schema (all fields optional)
export const UpdateChefSchema = ChefBaseSchema.partial();

// Full chef with database fields
export const ChefSchema = ChefBaseSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type Chef = z.infer<typeof ChefSchema>;
export type CreateChef = z.infer<typeof CreateChefSchema>;
export type UpdateChef = z.infer<typeof UpdateChefSchema>;
