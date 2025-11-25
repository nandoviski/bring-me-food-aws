import { z } from "zod";

// Chef signup data schema (for profile creation during signup)
export const ChefSignupDataSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must be at most 100 characters"),
  email: z.string().email("Invalid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  userType: z.literal("chef"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  specialties: z.string().max(250).optional().nullable(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ChefSignupData = z.infer<typeof ChefSignupDataSchema>;

// Customer signup data schema (for profile creation during signup)
export const CustomerSignupDataSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  userType: z.literal("customer"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CustomerSignupData = z.infer<typeof CustomerSignupDataSchema>;

// Union type for signup data
export type SignupData = ChefSignupData | CustomerSignupData;

// Sync user request schema
export const SyncUserSchema = z.object({
  email: z.email("Invalid email"),
  userType: z.enum(["chef", "customer"]).optional(),
  username: z.string().optional(),
  // Chef fields
  fullName: z.string().optional(),
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
  // Full signup data object (passed during signup flow)
  signupData: z.union([ChefSignupDataSchema, CustomerSignupDataSchema]).optional(),
});

export type SyncUserRequest = z.infer<typeof SyncUserSchema>;
