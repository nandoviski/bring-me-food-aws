import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { promoteTmpToFinal } from "../lib/s3Utils";

const prisma = new PrismaClient();

export const createMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, chefId, size, ingredients, allergens, image, stockLimit } = req.body;

    let imageUrl = image;
    // If image is a tmp key (we expect client to send key for tmp uploads), promote it
    if (typeof image === "string" && image.startsWith(process.env.TMP_PREFIX ?? "uploads/tmp")) {
      const { url } = await promoteTmpToFinal(image);
      imageUrl = url;
    }

    const newMeal = await prisma.meal.create({
      data: {
        name,
        description,
        price,
        chefId,
        size,
        ingredients,
        allergens,
        image: imageUrl,
        stockLimit: stockLimit ? Number(stockLimit) : null,
      },
    });

    res.status(201).json(newMeal);
  } catch (error: any) {
    res.status(500).json({ message: `Error creating a meal: ${error.message}` });
  }
};

export const updateMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mealId } = req.params;
    const { name, description, price, size, ingredients, allergens, image, stockLimit } = req.body;

    let imageUrl = image;
    if (typeof image === "string" && image.startsWith(process.env.TMP_PREFIX ?? "uploads/tmp")) {
      const { url } = await promoteTmpToFinal(image);
      imageUrl = url;
    }

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        name,
        description,
        price,
        size,
        ingredients,
        allergens,
        image: imageUrl,
        // null means "clear the limit" (unlimited); undefined means "don't change"
        stockLimit: stockLimit === "" ? null : stockLimit !== undefined ? Number(stockLimit) : undefined,
      },
    });

    res.status(200).json(updatedMeal);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating meal: ${error.message}` });
  }
};

export const getMealsByChef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;
    const meals = await prisma.meal.findMany({
      where: { chefId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { mealsOnOrders: true } },
      },
    });

    // Compute soldCount for meals with a stockLimit
    const mealIds = meals.filter((m) => m.stockLimit !== null).map((m) => m.id);
    const soldCounts: Record<string, number> = {};

    if (mealIds.length > 0) {
      const aggregates = await prisma.mealsOnOrders.groupBy({
        by: ["mealId"],
        where: {
          mealId: { in: mealIds },
          order: { status: { not: "CANCELLED" } },
        },
        _sum: { quantity: true },
      });
      for (const a of aggregates) {
        soldCounts[a.mealId] = a._sum.quantity ?? 0;
      }
    }

    const result = meals.map((m) => ({
      ...m,
      soldCount: soldCounts[m.id] ?? null,
      remainingStock: m.stockLimit !== null ? m.stockLimit - (soldCounts[m.id] ?? 0) : null,
    }));

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: `Error fetching chef's meals: ${error.message}` });
  }
};
