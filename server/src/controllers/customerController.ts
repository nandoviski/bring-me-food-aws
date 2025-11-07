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
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving chef: ${error.message}` });
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
    res.status(500).json({ error: `Error retrieving chef: ${error.message}` });
  }
};

export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Find customer by userId
    const customer = await prisma.customer.findFirst({ where: { userId } });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    // Query orders for this customer and include meal items and chef basic info
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        chef: { select: { id: true, name: true, username: true } },
        mealsOnOrders: { include: { meal: { select: { id: true, name: true, price: true } } } },
      },
    });

    const mapped = orders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentStatus: o.paymentStatus,
      deliveryAddress: o.deliveryAddress,
      notes: o.notes,
      createdAt: o.createdAt,
      chef: o.chef,
      meals: o.mealsOnOrders.map((mo) => ({
        id: mo.meal.id,
        name: mo.meal.name,
        price: mo.meal.price,
      })),
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving orders: ${error.message}` });
  }
};
