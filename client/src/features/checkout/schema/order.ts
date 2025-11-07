import z from "zod";

export interface Order {
  id?: string;
  status: string;
  chefId: string;
  paymentStatus: string;
  deliveryAddress: string;
  notes?: string;
  customerId: string;
  mealsOnOrders: {
    mealId: string;
    quantity: number;
  }[];
}

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
const createOrderSchema = z.object({
  chefId: z.string().optional(),
  customerId: z.string().optional(),
  mealsOnOrders: z
    .array(
      z.object({ mealId: z.string(), quantity: z.number().int().positive() }),
    )
    .min(1),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
});
