import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { promoteTmpToFinal } from "../lib/s3Utils";

const prisma = new PrismaClient();

export const createMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, chefId, size, ingredients, allergens, image } = req.body;

    let imageUrl = image;
    // If image is a tmp key (we expect client to send key for tmp uploads), promote it
    if (typeof image === "string" && image.startsWith(process.env.TMP_PREFIX ?? "uploads/tmp")) {
      const { url } = await promoteTmpToFinal(image);
      imageUrl = url;
    }

    const newMeal = await prisma.meal.create({
      data: { name, description, price, chefId, size, ingredients, allergens, image: imageUrl },
    });

    res.status(201).json(newMeal);
  } catch (error: any) {
    res.status(500).json({ message: `Error creating a meal: ${error.message}` });
  }
};

export const updateMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mealId } = req.params;
    const { name, description, price, size, ingredients, allergens, image } = req.body;

    let imageUrl = image;
    if (typeof image === "string" && image.startsWith(process.env.TMP_PREFIX ?? "uploads/tmp")) {
      const { url } = await promoteTmpToFinal(image);
      imageUrl = url;
    }

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: { name, description, price, size, ingredients, allergens, image: imageUrl },
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
    });
    res.status(200).json(meals);
  } catch (error: any) {
    res.status(500).json({ message: `Error fetching chef's meals: ${error.message}` });
  }
};
