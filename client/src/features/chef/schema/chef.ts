import { z } from "zod";

export type EditChefType = z.infer<typeof EditChefSchema>;
export const EditChefSchema = z.object({
  username: z
    .string()
    .nonempty("Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    })
    .min(3, "Username must contain at least 3 characters")
    .max(255),
  name: z.string().nonempty("Business Name is required").max(150),
  location: z.string().nonempty("Location is required").max(150),
  bio: z.string().optional(),
  specialties: z.string().optional(),
});
