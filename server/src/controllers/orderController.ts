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
  deliveryFee: z.number().nonnegative().optional(),
});

const ChefIdParamSchema = z.object({
  chefId: z.string().uuid("Invalid chef ID format"),
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
          total,
          deliveryFee: payload.deliveryFee || 0,
          deliveryAddress,
          notes: payload.notes,
        },
      });

      // Create meal entries with quantity and priceAtPurchase
      for (const mealItem of payload.meals) {
        const meal = meals.find((m) => m.id === mealItem.mealId)!;
        await tx.mealsOnOrders.create({
          data: {
            mealId: mealItem.mealId,
            orderId: order.id,
            quantity: mealItem.quantity,
            priceAtPurchase: meal.price,
          },
        });
      }

      return order;
    });

    return res.status(201).json({
      orderId: created.id,
      status: created.status,
      createdAt: created.createdAt,
      total: created.total,
      deliveryFee: created.deliveryFee,
      grandTotal: created.total + created.deliveryFee,
    });
  } catch (err: any) {
    console.error("createOrder error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", errors: err.issues });
    }
    console.error("createOrder error", err);
    return res.status(500).json({ message: "Error fetching orders" });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("updateOrderStatus error", err);
    return res.status(500).json({ message: "Error updating order status" });
  }
}

export async function getOrdersByChefId(req: Request, res: Response) {
  try {
    // Validate chef ID from URL params
    const { chefId } = ChefIdParamSchema.parse({ chefId: req.params.chefId });

    // Verify chef exists
    const chef = await prisma.chef.findUnique({ where: { id: chefId } });
    if (!chef) {
      return res.status(404).json({ message: "Chef not found", success: false });
    }

    // Fetch orders with related data
    const orders = await prisma.order.findMany({
      where: {
        chefId,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            address: true,
            city: true,
            state: true,
            country: true,
            postalCode: true,
          },
        },
        mealsOnOrders: {
          include: {
            meal: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return orders with totals and delivery fees
    const ordersWithDetails = orders.map((order) => ({
      ...order,
      grandTotal: order.total + order.deliveryFee,
    }));

    return res.status(200).json(ordersWithDetails);
  } catch (err: any) {
    console.error("getOrdersByChefId error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid chef ID",
        details: err.issues,
        success: false,
      });
    }
    return res.status(500).json({ message: "Error fetching orders", success: false });
  }
}
