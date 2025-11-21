import { z } from "zod";

// Sync user request schema
export const SyncUserSchema = z.object({
  email: z.email("Invalid email"),
  userType: z.enum(["chef", "customer"]).optional(),
  // Chef fields
  location: z.string().min(2, "Location must be at least 2 characters").optional(),
  specialties: z.string().max(250).optional(),
  // Customer fields
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters").optional(),
  address: z.string().min(1, "Address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(2, "State must be at least 2 characters").optional(),
  country: z.string().min(1, "Country is required").optional(),
  postalCode: z.string().min(1, "Postal code is required").optional(),
});

export type SyncUserRequest = z.infer<typeof SyncUserSchema>;
