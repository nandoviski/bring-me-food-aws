import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

interface ChefEdit {
  username: string;
  name: string;
  location: string;
  bio?: string;
  specialties?: string;
}

const prisma = new PrismaClient();

export const getChefByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const chef = await prisma.chef.findUnique({
      where: {
        username,
      },
    });
    res.status(200).json(chef);
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving chef: ${error.message}` });
  }
};

export const checkChefUsernameExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const chef = await prisma.chef.findUnique({ where: { username } });

    res.status(200).json({ exists: !!chef });
  } catch (error: any) {
    res.status(500).json({ error: `Error checking username: ${error.message}` });
  }
};

export const getChefsWeeklyMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;

    const menu = await prisma.menu.findFirst({
      where: {
        chefId,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        meals: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    console.log("menu", menu);

    res.status(200).json(menu);
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving weekly menu: ${error.message}` });
  }
};

export const updateChef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;
    const data: ChefEdit = req.body;

    const chef = await prisma.chef.update({
      where: { id: chefId },
      data,
    });

    res.status(200).json(chef !== null);
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving chef: ${error.message}` });
  }
};

export const getChefByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const chef = await prisma.chef.findFirst({
      where: { userId: userId },
    });

    res.status(200).json(chef);
  } catch (error: any) {
    res.status(500).json({ error: `Error retrieving chef: ${error.message}` });
  }
};
