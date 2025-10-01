import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const meals = await prisma.meal.findMany();
    res.status(200).json(meals);
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving meals: ${error.message}` });
  }
};

export const createMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, chefId, size, ingredients, allergens, image } = req.body;
    const newMeal = await prisma.meal.create({
      data: { name, description, price, chefId, size, ingredients, allergens, image },
    });

    res.status(201).json(newMeal);
  } catch (error: any) {
    res.status(500).json({ error: `Error creating a meal: ${error.message}` });
  }
};

export const updateMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mealId } = req.params;
    const { name, description, price, size, ingredients, allergens, image } = req.body;

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: { name, description, price, size, ingredients, allergens, image },
    });

    res.status(200).json(updatedMeal);
  } catch (error: any) {
    res.status(500).json({ error: `Error updating meal: ${error.message}` });
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
    res.status(500).json({ error: `Error fetching chef's meals: ${error.message}` });
  }
};
