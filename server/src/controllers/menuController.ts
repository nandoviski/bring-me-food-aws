import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, chefId, description, startDate, endDate, orderFrom, orderTo, meals } = req.body;

    const menu = {
      name,
      chefId,
      description,
      startDate,
      endDate,
      orderFrom,
      orderTo,
      meals: meals && Array.isArray(meals) ? { connect: meals.map((mealId: string) => ({ id: mealId })) } : undefined,
    };

    const newMenu = await prisma.menu.create({
      data: menu,
    });

    res.status(201).json(newMenu);
  } catch (error: any) {
    res.status(500).json({ error: `Error creating a menu: ${error.message}` });
  }
};

export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    const { name, description, startDate, endDate, orderFrom, orderTo, meals } = req.body;

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name,
        description,
        startDate,
        endDate,
        orderFrom,
        orderTo,
        meals: {
          set: meals && Array.isArray(meals) ? meals.map((mealId: string) => ({ id: mealId })) : [],
        },
      },
      include: { meals: true },
    });

    res.status(200).json(updatedMenu);
  } catch (error: any) {
    res.status(500).json({ error: `Error updating menu: ${error.message}` });
  }
};

export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;

    const deletedMenu = await prisma.menu.delete({
      where: { id: menuId },
    });

    res.status(200).json(deletedMenu != null);
  } catch (error: any) {
    res.status(500).json({ error: `Error deleting menu: ${error.message}` });
  }
};

export const getMenusByChef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;
    const { filter } = req.query;

    if (filter === "upcoming") {
      // Active and upcoming menus
      const menus = await prisma.menu.findMany({
        where: { chefId, endDate: { gte: new Date() } },
        orderBy: { endDate: "asc" },
        include: { meals: true },
      });
      res.status(200).json(menus);
    } else if (filter === "past") {
      // Past menus
      const menus = await prisma.menu.findMany({
        where: { chefId, endDate: { lt: new Date() } },
        orderBy: { endDate: "asc" },
        include: { meals: true },
      });
      res.status(200).json(menus);
    } else {
      // All menus
      const menus = await prisma.menu.findMany({
        where: { chefId },
        orderBy: { endDate: "desc" },
        include: { meals: true },
      });
      res.status(200).json(menus);
    }
  } catch (error: any) {
    res.status(500).json({ error: `Error fetching chef's menus: ${error.message}` });
  }
};
