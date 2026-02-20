import z from "zod";
import { Customer } from "./customer";
import { Meal } from "./meal";
import { Chef } from "./chef";

/**
 * Order - Single source of truth for order data
 * Works for both API responses and display purposes
 */
export interface Order {
  id: string;
  status: string;
  paymentStatus?: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  chefId: string;
  customerId: string | null;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  notes?: string | null;
  createdAt: string;
  grandTotal?: number;
  // Guest checkout fields
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  // Stripe fields
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;

  customer?: Customer;
  chef?: Chef;
  meals?: Array<Meal>;

  // Backend detailed structure with quantities and prices at purchase
  mealsOnOrders?: Array<{
    quantity: number;
    priceAtPurchase: number;
    meal: Meal;
  }>;
}

/**
 * OrderCreate - Form input type for creating orders
 * Only includes fields needed for order creation
 */
export const createOrderSchema = z.object({
  chefId: z.string().optional(),
  customerId: z.string().optional(),
  // Guest checkout fields
  guestName: z.string().min(1).max(150).optional(),
  guestPhone: z.string().min(1).max(20).optional(),
  guestEmail: z.string().email().optional(),
  meals: z
    .array(
      z.object({ mealId: z.string(), quantity: z.number().int().positive() }),
    )
    .min(1),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryFee: z.number().nonnegative().optional(),
});

export type OrderCreate = z.infer<typeof createOrderSchema>;
