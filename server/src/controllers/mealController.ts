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
    const { name, description, price, chefId } = req.body;
    const newMeal = await prisma.meal.create({
      data: { name, description, price, chefId },
    });
    res.status(201).json(newMeal);
  } catch (error: any) {
    res.status(500).json({ error: `Error creating a meal: ${error.message}` });
  }
};
