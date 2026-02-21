import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { userId },
    });

    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving chef: ${error.message}` });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const customer = req.body;

    const costumerUpdated = await prisma.customer.update({
      where: { userId },
      data: { ...customer },
    });

    res.status(200).json(costumerUpdated !== null);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving chef: ${error.message}` });
  }
};

export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Find customer + their user email (to also catch guest orders placed with same email)
    const customer = await prisma.customer.findFirst({
      where: { userId },
      include: { user: { select: { email: true } } },
    });
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    const includeConfig = {
      chef: { select: { id: true, name: true, username: true } },
      mealsOnOrders: {
        select: {
          quantity: true,
          priceAtPurchase: true,
          meal: { select: { id: true, name: true, price: true } },
        },
      },
    };

    // Fetch both linked orders AND guest orders by email in parallel
    const [linkedOrders, guestOrders] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        include: includeConfig,
      }),
      customer.user?.email
        ? prisma.order.findMany({
            where: { customerId: null, guestEmail: customer.user.email },
            orderBy: { createdAt: "desc" },
            include: includeConfig,
          })
        : Promise.resolve([]),
    ]);

    // Merge, deduplicate, sort
    const seen = new Set<string>();
    const allOrders = [...linkedOrders, ...guestOrders].filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const mapped = allOrders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.total,
      deliveryFee: o.deliveryFee,
      grandTotal: o.total + o.deliveryFee,
      deliveryAddress: o.deliveryAddress,
      notes: o.notes,
      createdAt: o.createdAt,
      chef: o.chef,
      isGuest: !o.customerId,
      meals: o.mealsOnOrders.map((mo) => ({
        id: mo.meal.id,
        name: mo.meal.name,
        price: mo.meal.price,
        quantity: mo.quantity,
        priceAtPurchase: mo.priceAtPurchase,
      })),
      promoCode: o.promoCode,
      discountAmount: o.discountAmount,
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving orders: ${error.message}` });
  }
};
