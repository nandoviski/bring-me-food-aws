import z from "zod";

export interface Order {
  id?: string;
  status: string;
  chefId: string;
  paymentStatus: string;
  deliveryAddress: string;
  notes?: string;
  customerId: string;
  meals: {
    mealId: string;
    quantity: number;
  }[];
}

type Meal = { id: string; name: string; price: number };
export type OrderShape = {
  id: string;
  status: string;
  paymentStatus?: string;
  deliveryAddress?: string;
  notes?: string | null;
  createdAt: string;
  chef?: { id?: string; name?: string; username?: string };
  meals: Meal[];
};

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
const createOrderSchema = z.object({
  chefId: z.string().optional(),
  customerId: z.string().optional(),
  meals: z
    .array(
      z.object({ mealId: z.string(), quantity: z.number().int().positive() }),
    )
    .min(1),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
});
