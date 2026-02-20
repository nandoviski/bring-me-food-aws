import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { sendOrderConfirmationEmail, sendNewOrderNotification } from "../lib/email";

const prisma = new PrismaClient();

const createOrderSchema = z.object({
  chefId: z.string().optional(),
  customerId: z.string().optional(),
  // Guest checkout fields
  guestName: z.string().min(1).max(150).optional(),
  guestPhone: z.string().min(1).max(20).optional(),
  guestEmail: z.string().email().optional(),
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

    // If logged in and no explicit customerId, try to find their customer record
    let resolvedCustomerId = payload.customerId || null;
    if (!resolvedCustomerId && (req as any).user?.id) {
      const customerByUser = await prisma.customer.findFirst({
        where: { userId: (req as any).user.id },
      });
      if (customerByUser) resolvedCustomerId = customerByUser.id;
    }

    const isGuest = !resolvedCustomerId;

    // Validate: need either a linked customer OR guest details
    if (isGuest) {
      if (!payload.guestName) {
        return res.status(400).json({ message: "guestName is required for guest orders" });
      }
      if (!payload.guestPhone) {
        return res.status(400).json({ message: "guestPhone is required for guest orders" });
      }
      if (!payload.deliveryAddress) {
        return res.status(400).json({ message: "deliveryAddress is required for guest orders" });
      }
    }

    const customerId = resolvedCustomerId;

    let customer = null;
    if (customerId) {
      customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) return res.status(400).json({ message: "Customer not found" });
    }

    const mealIds = payload.meals.map((i) => i.mealId);
    const meals = await prisma.meal.findMany({ where: { id: { in: mealIds } } });
    if (meals.length !== mealIds.length) {
      return res.status(400).json({ message: "One or more meals not found" });
    }

    const total = payload.meals.reduce((sum, it) => {
      const meal = meals.find((m) => m.id === it.mealId)!;
      return sum + meal.price * it.quantity;
    }, 0);

    const deliveryAddress = payload.deliveryAddress ?? customer?.address ?? "";

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
          // Guest fields
          guestName: isGuest ? payload.guestName : null,
          guestPhone: isGuest ? payload.guestPhone : null,
          guestEmail: isGuest ? payload.guestEmail : null,
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

    // Fetch chef with their user account (for email)
    const chefWithUser = await prisma.chef.findUnique({
      where: { id: chefId! },
      include: { user: true },
    });

    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

    // Determine customer name/phone for notification
    const customerName = isGuest
      ? payload.guestName!
      : `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim();
    const customerPhone = isGuest
      ? payload.guestPhone!
      : customer?.phoneNumber ?? "—";
    const customerEmail = isGuest ? payload.guestEmail : undefined;

    const orderItems = payload.meals.map((m) => {
      const meal = meals.find((ml) => ml.id === m.mealId)!;
      return { name: meal.name, quantity: m.quantity, price: meal.price };
    });

    // Send emails async (non-blocking)
    setImmediate(() => {
      // 1. Chef gets new-order notification
      if (chefWithUser?.user?.email) {
        sendNewOrderNotification({
          chefName: chefWithUser.name,
          chefEmail: chefWithUser.user.email,
          orderId: created.id,
          customerName,
          customerPhone,
          customerEmail,
          total: created.total,
          deliveryFee: created.deliveryFee,
          deliveryAddress: created.deliveryAddress,
          notes: created.notes ?? undefined,
          items: orderItems,
          dashboardLink: `${appBaseUrl}/account/chef/orders`,
        }).catch((e) => console.error("[email] new order notification error:", e));
      }

      // 2. Guest customer gets confirmation if email provided
      if (isGuest && payload.guestEmail) {
        const stripeConfigured = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_placeholder";
        sendOrderConfirmationEmail(payload.guestEmail, {
          guestName: customerName,
          chefName: chefWithUser?.name ?? "your chef",
          chefPhone: chefWithUser?.phoneNumber ?? undefined,
          orderId: created.id,
          total: created.total,
          deliveryFee: created.deliveryFee,
          deliveryAddress: created.deliveryAddress,
          notes: created.notes ?? undefined,
          items: orderItems,
          payLink: stripeConfigured ? `${appBaseUrl}/order/pay/${created.id}` : undefined,
        }).catch((e) => console.error("[email] order confirmation error:", e));
      }
    });

    return res.status(201).json({
      orderId: created.id,
      status: created.status,
      createdAt: created.createdAt,
      total: created.total,
      deliveryFee: created.deliveryFee,
      grandTotal: created.total + created.deliveryFee,
      isGuest,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", errors: err.issues });
    }
    console.error("createOrder error", err);
    return res.status(500).json({ message: "Error creating order" });
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
