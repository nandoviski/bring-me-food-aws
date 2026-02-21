import { z } from "zod";

// Common fields for both user types
const baseSignUpFields = {
  fullName: z
    .string({ message: "Full name is required" })
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address"),
  username: z
    .string({ message: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain a special character",
    ),
  confirmPassword: z.string({ message: "Please confirm your password" }),
  userType: z.enum(["chef", "customer"], {
    message: "Please select a user type",
  }),
};

// Chef-specific sign-up schema
export const ChefSignUpSchema = z
  .object({
    ...baseSignUpFields,
    userType: z.literal("chef"),
    location: z
      .string({ message: "Location is required" })
      .min(2, "Location is required"),
    specialties: z.string().optional().nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChefSignUpType = z.infer<typeof ChefSignUpSchema>;

// Customer-specific sign-up schema
export const CustomerSignUpSchema = z
  .object({
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address"),
    username: z
      .string({ message: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      ),
    password: z
      .string({ message: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain a special character",
      ),
    confirmPassword: z.string({ message: "Please confirm your password" }),
    userType: z.literal("customer"),
    firstName: z
      .string({ message: "First name is required" })
      .min(1, "First name is required"),
    lastName: z
      .string({ message: "Last name is required" })
      .min(1, "Last name is required"),
    phoneNumber: z
      .string({ message: "Phone number is required" })
      .min(10, "Phone number must be at least 10 characters"),
    address: z
      .string({ message: "Address is required" })
      .min(1, "Address is required"),
    city: z.string({ message: "City is required" }).min(1, "City is required"),
    state: z
      .string({ message: "State is required" })
      .min(2, "State must be at least 2 characters"),
    country: z.string().optional(),
    postalCode: z
      .string({ message: "Postal code is required" })
      .min(1, "Postal code is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CustomerSignUpType = z.infer<typeof CustomerSignUpSchema>;

// Union type for both sign-up types
export type SignUpType = ChefSignUpType | CustomerSignUpType;

export const LoginSchema = z.object({
  email: z.string({ message: "Email or username is required" }),
  password: z.string({ message: "Password is required" }),
});

export type LoginType = z.infer<typeof LoginSchema>;
