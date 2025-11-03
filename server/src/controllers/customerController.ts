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
