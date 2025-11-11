import { z } from "zod";

// Order status enum
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// Payment status enum
export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

// Meal on order schema
export const MealOnOrderSchema = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// Base schema for validation
export const OrderBaseSchema = z.object({
  deliveryAddress: z.string().min(5, "Delivery address is required").max(250),
  notes: z.string().max(300).optional(),
  deliveryFee: z.number().nonnegative("Delivery fee cannot be negative").default(0),
  meals: z.array(MealOnOrderSchema).min(1, "At least one meal is required"),
});

// Create schema
export const CreateOrderSchema = OrderBaseSchema.extend({
  chefId: z.string().uuid("Invalid chef ID"),
  customerId: z.string().uuid("Invalid customer ID"),
});

// Update schema (all fields optional)
export const UpdateOrderSchema = OrderBaseSchema.partial();

// Full order with database fields
export const OrderSchema = OrderBaseSchema.extend({
  id: z.string().uuid(),
  chefId: z.string().uuid(),
  customerId: z.string().uuid(),
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ]),
  paymentStatus: z.enum([
    PaymentStatus.PENDING,
    PaymentStatus.PAID,
    PaymentStatus.REFUNDED,
    PaymentStatus.FAILED,
  ]),
  total: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type MealOnOrder = z.infer<typeof MealOnOrderSchema>;
