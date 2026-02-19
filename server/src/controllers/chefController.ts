import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { promoteTmpToFinal } from "../lib/s3Utils";

interface ChefEdit {
  username: string;
  name: string;
  location: string;
  bio?: string;
  specialties?: string;
  profileImage?: string;
  profileImageKey?: string; // tmp S3 key — will be promoted to final
  phoneNumber?: string;
}

const prisma = new PrismaClient();

export const getChefByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const normalized = username?.toLowerCase();

    const chef = await prisma.chef.findUnique({
      where: {
        username: normalized,
      },
    });
    res.status(200).json(chef);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving chef: ${error.message}` });
  }
};

export const checkChefUsernameExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const normalized = username?.toLowerCase();

    const chef = await prisma.chef.findUnique({ where: { username: normalized } });

    res.status(200).json({ exists: !!chef });
  } catch (error: any) {
    res.status(500).json({ message: `Error checking username: ${error.message}` });
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

    res.status(200).json(menu);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving weekly menu: ${error.message}` });
  }
};

export const updateChef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;
    const data: ChefEdit = req.body;

    const updateData: any = {
      name: data.name,
      location: data.location,
      bio: data.bio,
      specialties: data.specialties,
      phoneNumber: data.phoneNumber,
    };

    // Normalize username
    if (data.username) {
      updateData.username = data.username.toLowerCase().trim();
    }

    // Promote profile image from tmp to final if a new key was provided
    if (data.profileImageKey) {
      try {
        const { url } = await promoteTmpToFinal(data.profileImageKey);
        updateData.profileImage = url;
      } catch (e) {
        console.error("Failed to promote profile image:", e);
        // Don't fail the whole update — just skip image
      }
    }

    const chef = await prisma.chef.update({
      where: { id: chefId },
      data: updateData,
    });

    res.status(200).json(chef !== null);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating chef: ${error.message}` });
  }
};

export const getChefStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;

    const chef = await prisma.chef.findUnique({ where: { id: chefId } });
    if (!chef) { res.status(404).json({ message: "Chef not found" }); return; }

    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const [thisWeekOrders, lastWeekOrders, activeMeals, pendingOrders] = await Promise.all([
      prisma.order.findMany({
        where: { chefId, createdAt: { gte: startOfThisWeek } },
        select: { total: true, deliveryFee: true, customerId: true },
      }),
      prisma.order.findMany({
        where: { chefId, createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } },
        select: { total: true, deliveryFee: true, customerId: true },
      }),
      prisma.meal.count({ where: { chefId } }),
      prisma.order.count({ where: { chefId, status: "PENDING" } }),
    ]);

    const revenueThisWeek = thisWeekOrders.reduce((s, o) => s + o.total + o.deliveryFee, 0);
    const revenueLastWeek = lastWeekOrders.reduce((s, o) => s + o.total + o.deliveryFee, 0);

    const revenueChange = revenueLastWeek === 0
      ? null
      : ((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100;

    const ordersChange = lastWeekOrders.length === 0
      ? null
      : ((thisWeekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100;

    const uniqueCustomersThisWeek = new Set(thisWeekOrders.map((o) => o.customerId)).size;
    const uniqueCustomersLastWeek = new Set(lastWeekOrders.map((o) => o.customerId)).size;
    const customersChange = uniqueCustomersLastWeek === 0
      ? null
      : uniqueCustomersThisWeek - uniqueCustomersLastWeek;

    res.status(200).json({
      revenueThisWeek,
      revenueChange,
      ordersThisWeek: thisWeekOrders.length,
      ordersChange,
      activeMeals,
      pendingOrders,
      uniqueCustomersThisWeek,
      customersChange,
    });
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving chef stats: ${error.message}` });
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
    res.status(500).json({ message: `Error retrieving chef: ${error.message}` });
  }
};

/**
 * GET /chefs
 * List all active chefs with basic profile info.
 * Optional query: ?search=name|location|specialties
 */
export const getAllChefs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const chefs = await prisma.chef.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search as string, mode: "insensitive" } },
              { location: { contains: search as string, mode: "insensitive" } },
              { specialties: { contains: search as string, mode: "insensitive" } },
              { username: { contains: search as string, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        username: true,
        name: true,
        location: true,
        bio: true,
        specialties: true,
        profileImage: true,
        _count: { select: { meals: true, order: true } },
      },
      orderBy: { order: { _count: "desc" } },
    });

    res.status(200).json({ chefs });
  } catch (error: any) {
    res.status(500).json({ message: `Error listing chefs: ${error.message}` });
  }
};
