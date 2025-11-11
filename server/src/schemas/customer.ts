import { z } from "zod";

// Base schema for validation
export const CustomerBaseSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(150),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(150),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  address: z.string().min(5, "Address must be at least 5 characters").max(250),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  state: z.string().min(2, "State must be at least 2 characters").max(3),
  country: z.string().min(2, "Country must be at least 2 characters").max(3),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters").max(10),
  company: z.string().max(150).optional().nullable(),
});

// Create schema
export const CreateCustomerSchema = CustomerBaseSchema.extend({
  userId: z.string().uuid("Invalid user ID"),
});

// Update schema (all fields optional)
export const UpdateCustomerSchema = CustomerBaseSchema.partial();

// Full customer with database fields
export const CustomerSchema = CustomerBaseSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;
