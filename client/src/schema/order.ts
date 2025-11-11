import z from "zod";

/**
 * Order - Single source of truth for order data
 * Works for both API responses and display purposes
 */
export interface Order {
  id: string;
  status: string;
  chefId: string;
  customerId: string;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  notes?: string | null;
  createdAt: string;
  grandTotal?: number;

  // Customer details (from backend)
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  // Chef details (optional, for display)
  chef?: {
    id?: string;
    name?: string;
    username?: string;
  };

  // Meals - works both ways: full meal objects or simple list
  meals?: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string | null;
  }>;

  // Backend detailed structure with quantities and prices at purchase
  mealsOnOrders?: Array<{
    quantity: number;
    priceAtPurchase: number;
    meal: {
      id: string;
      name: string;
      description: string;
      price: number;
      image: string | null;
    };
  }>;
}

/**
 * OrderCreate - Form input type for creating orders
 * Only includes fields needed for order creation
 */
export const createOrderSchema = z.object({
  chefId: z.string().optional(),
  customerId: z.string().optional(),
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

// Helper functions for common display patterns
export function getOrderCustomerName(order: Order): string {
  if (order.customer) {
    return `${order.customer.firstName} ${order.customer.lastName}`;
  }
  return "-";
}

export function getOrderDate(order: Order): string {
  return order.createdAt;
}

export function getOrderMeals(
  order: Order,
): Array<{ id: string; name: string; price: number }> {
  if (order.meals) {
    return order.meals;
  }
  if (order.mealsOnOrders) {
    return order.mealsOnOrders.map((m) => ({
      id: m.meal.id,
      name: m.meal.name,
      price: m.meal.price,
    }));
  }
  return [];
}

// Backwards compatibility aliases
export type OrderShape = Order;
export type ChefOrderWithDetails = Order;
export type OrderForDisplay = Order;
export const CreateOrderSchema = createOrderSchema;
export type CreateOrderSchema = OrderCreate;

/**
 * Transform function for backward compatibility
 * Converts Order structure to display-friendly format
 */
export function transformOrder(order: Order): {
  id: string;
  customer: string;
  date: string;
  status: string;
  total: number;
  meals?: Array<{ id: string; name: string; price: number }>;
} {
  return {
    id: order.id,
    customer: getOrderCustomerName(order),
    date: order.createdAt,
    status: order.status,
    total: order.total || order.grandTotal || 0,
    meals: getOrderMeals(order),
  };
}
