import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendMenuEmail } from "../lib/email";

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
      meals:
        meals && Array.isArray(meals)
          ? { connect: meals.map((mealId: string) => ({ id: mealId })) }
          : undefined,
    };

    const newMenu = await prisma.menu.create({
      data: menu,
    });

    res.status(201).json(newMenu);
  } catch (error: any) {
    res.status(500).json({ message: `Error creating a menu: ${error.message}` });
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
    res.status(500).json({ message: `Error updating menu: ${error.message}` });
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
    res.status(500).json({ message: `Error deleting menu: ${error.message}` });
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
    res.status(500).json({ message: `Error fetching chef's menus: ${error.message}` });
  }
};

/**
 * POST /menus/:menuId/distribute
 * Send this menu to all active subscribers of the chef who owns it.
 * Requires chef auth (enforced in router).
 */
export const distributeMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        meals: true,
        chef: true,
      },
    });

    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    const chef = menu.chef;

    // Fetch active subscribers for this chef
    const subscribers = await prisma.subscriber.findMany({
      where: { chefId: chef.id, unsubscribed: false },
    });

    if (subscribers.length === 0) {
      res.status(200).json({
        message: "No subscribers to send to",
        sent: 0,
        failed: 0,
      });
      return;
    }

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });

    const results = await Promise.allSettled(
      subscribers.map((sub) =>
        sendMenuEmail(sub.email, {
          chefName: chef.name,
          chefUsername: chef.username,
          menuName: menu.name,
          menuDescription: menu.description,
          startDate: fmt(new Date(menu.startDate)),
          endDate: fmt(new Date(menu.endDate)),
          orderFrom: menu.orderFrom ? fmt(new Date(menu.orderFrom)) : undefined,
          orderTo: menu.orderTo ? fmt(new Date(menu.orderTo)) : undefined,
          meals: menu.meals.map((m) => ({
            name: m.name,
            description: m.description,
            price: m.price,
            allergens: m.allergens,
            ingredients: m.ingredients,
          })),
          orderLink: `${appBaseUrl}/chef/${chef.username}`,
          unsubscribeLink: `${appBaseUrl}/api/subscribers/${chef.id}/unsubscribe?email=${encodeURIComponent(sub.email)}`,
        }),
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled" && (r.value as any).success).length;
    const failed = results.length - sent;

    // Mark as distributed
    await prisma.menu.update({
      where: { id: menuId },
      data: { distributedAt: new Date() },
    });

    res.status(200).json({
      message: `Menu distributed to ${sent} subscriber${sent !== 1 ? "s" : ""}`,
      sent,
      failed,
      total: subscribers.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: `Error distributing menu: ${error.message}` });
  }
};
