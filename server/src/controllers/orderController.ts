import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createOrderSchema = z.object({
  chefId: z.string().optional(),
  customerId: z.string().optional(),
  meals: z.array(z.object({ mealId: z.string(), quantity: z.number().int().positive() })).min(1),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
});

export async function createOrder(req: Request, res: Response) {
  try {
    const payload = createOrderSchema.parse(req.body);

    // TODO: get the logged in user from auth middleware
    const customerId = payload.customerId || (req as any).user?.id;
    if (!customerId) return res.status(400).json({ message: "customerId required" });

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return res.status(400).json({ message: "Customer not found" });

    const mealIds = payload.meals.map((i) => i.mealId);
    const meals = await prisma.meal.findMany({ where: { id: { in: mealIds } } });
    if (meals.length !== mealIds.length) {
      return res.status(400).json({ message: "One or more meals not found" });
    }

    const total = payload.meals.reduce((sum, it) => {
      const meal = meals.find((m) => m.id === it.mealId)!;
      return sum + meal.price * it.quantity;
    }, 0);

    const deliveryAddress = payload.deliveryAddress ?? customer.address;

    // Derive chefId from meals if not provided; ensure all meals belong to same chef
    let chefId = payload.chefId;
    if (!chefId) {
      const chefIds = Array.from(new Set(meals.map((m) => m.chefId)));
      if (chefIds.length !== 1) {
        return res
          .status(400)
          .json({ message: "All meals in an order must belong to the same chef" });
      }
      chefId = chefIds[0];
    }

    // Create order and meals in a transaction
    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          chefId,
          customerId,
          status: "PENDING",
          deliveryAddress,
          notes: payload.notes,
        },
      });

      const mData = payload.meals.map((it) => ({ mealId: it.mealId, orderId: order.id }));

      // createMany doesn't return rows; use create for each to be safe with relations
      for (const md of mData) {
        await tx.mealsOnOrders.create({ data: md });
      }

      return order;
    });

    return res
      .status(201)
      .json({ orderId: created.id, status: created.status, createdAt: created.createdAt, total });
  } catch (err: any) {
    console.error("createOrder error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", errors: err.issues });
    }
    console.error("createOrder error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
