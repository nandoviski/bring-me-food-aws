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
          orderBy: { name: "asc" },
        },
      },
    });

    if (!menu) {
      res.status(200).json(null);
      return;
    }

    // Add remaining stock info for meals with stockLimit
    const mealIdsWithLimit = menu.meals.filter((m) => m.stockLimit !== null).map((m) => m.id);
    const soldCounts: Record<string, number> = {};

    if (mealIdsWithLimit.length > 0) {
      const aggregates = await prisma.mealsOnOrders.groupBy({
        by: ["mealId"],
        where: {
          mealId: { in: mealIdsWithLimit },
          order: { status: { not: "CANCELLED" } },
        },
        _sum: { quantity: true },
      });
      for (const a of aggregates) {
        soldCounts[a.mealId] = a._sum.quantity ?? 0;
      }
    }

    const mealsWithStock = menu.meals.map((m) => ({
      ...m,
      soldCount: soldCounts[m.id] ?? null,
      remainingStock: m.stockLimit !== null ? m.stockLimit - (soldCounts[m.id] ?? 0) : null,
    }));

    res.status(200).json({ ...menu, meals: mealsWithStock });
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

    const [thisWeekOrders, lastWeekOrders, activeMeals, pendingOrders, paidOrdersThisWeek, awaitingPaymentCount] = await Promise.all([
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
      // Paid orders this week (Stripe payment confirmed)
      prisma.order.findMany({
        where: { chefId, createdAt: { gte: startOfThisWeek }, paymentStatus: "PAID" },
        select: { total: true, deliveryFee: true },
      }),
      // Orders awaiting payment (created but not paid)
      prisma.order.count({
        where: { chefId, paymentStatus: "PENDING", status: { not: "CANCELLED" } },
      }),
    ]);

    const revenueThisWeek = thisWeekOrders.reduce((s, o) => s + o.total + o.deliveryFee, 0);
    const revenueLastWeek = lastWeekOrders.reduce((s, o) => s + o.total + o.deliveryFee, 0);
    const paidRevenueThisWeek = paidOrdersThisWeek.reduce((s, o) => s + o.total + o.deliveryFee, 0);

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
      paidRevenueThisWeek,
      awaitingPaymentCount,
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

/**
 * GET /chefs/:chefId/popular-meals
 * Returns the top 5 most-ordered meals for this chef (all time).
 */
export const getPopularMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;

    const popular = await prisma.mealsOnOrders.groupBy({
      by: ["mealId"],
      where: { meal: { chefId } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    if (popular.length === 0) {
      res.status(200).json({ meals: [] });
      return;
    }

    const mealIds = popular.map((p) => p.mealId);
    const meals = await prisma.meal.findMany({
      where: { id: { in: mealIds } },
      select: { id: true, name: true, price: true },
    });

    const result = popular.map((p) => {
      const meal = meals.find((m) => m.id === p.mealId)!;
      return {
        id: p.mealId,
        name: meal?.name ?? "Unknown",
        price: meal?.price ?? 0,
        totalOrdered: p._sum.quantity ?? 0,
        totalRevenue: (meal?.price ?? 0) * (p._sum.quantity ?? 0),
      };
    });

    res.status(200).json({ meals: result });
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving popular meals: ${error.message}` });
  }
};

// GET /chefs/:chefId/delivery-zones
export const getDeliveryZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;
    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
      select: { deliveryMode: true, deliveryZones: true, deliveryCities: true },
    });
    if (!chef) { res.status(404).json({ message: "Chef not found" }); return; }
    res.status(200).json(chef);
  } catch (error: any) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// PUT /chefs/:chefId/delivery-zones
export const updateDeliveryZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chefId } = req.params;
    const { deliveryMode, deliveryZones, deliveryCities } = req.body;

    if (!["ALL", "ZONES"].includes(deliveryMode)) {
      res.status(400).json({ message: "deliveryMode must be ALL or ZONES" }); return;
    }

    const updated = await prisma.chef.update({
      where: { id: chefId },
      data: {
        deliveryMode,
        deliveryZones: deliveryMode === "ZONES" ? (deliveryZones ?? []) : [],
        deliveryCities: deliveryMode === "ZONES" ? (deliveryCities ?? []) : [],
      },
      select: { deliveryMode: true, deliveryZones: true, deliveryCities: true },
    });

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

/**
 * GET /chefs/:chefId/revenue-trend
 * Returns daily revenue (total + delivery fee) and order count for the last N days (default 30).
 * Excludes cancelled orders. Chef-authenticated.
 */
export const getRevenueTrend = async (req: Request, res: Response): Promise<void> => {
  const { chefId } = req.params;
  const days = Math.min(parseInt(String(req.query.days ?? "30"), 10) || 30, 90);

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        chefId,
        status: { not: "CANCELLED" },
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        total: true,
        deliveryFee: true,
        paymentStatus: true,
      },
    });

    // Bucket by day (YYYY-MM-DD in Australia/Sydney time)
    const buckets: Record<string, { date: string; revenue: number; paidRevenue: number; orders: number }> = {};

    // Prefill all days so gaps show as zero
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" }); // YYYY-MM-DD
      const label = d.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "short" });
      buckets[key] = { date: label, revenue: 0, paidRevenue: 0, orders: 0 };
    }

    for (const o of orders) {
      const key = new Date(o.createdAt).toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
      if (!buckets[key]) continue;
      const grand = o.total + o.deliveryFee;
      buckets[key].revenue += grand;
      if (o.paymentStatus === "PAID") buckets[key].paidRevenue += grand;
      buckets[key].orders += 1;
    }

    const trend = Object.values(buckets).map((b) => ({
      ...b,
      revenue: Math.round(b.revenue * 100) / 100,
      paidRevenue: Math.round(b.paidRevenue * 100) / 100,
    }));

    res.status(200).json({ days, trend });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

// Helper: check if a suburb is within a chef's delivery zones
export function isSuburbAllowed(
  suburb: string,
  mode: string,
  zones: string[],
  cities: string[],
): boolean {
  if (mode === "ALL") return true;
  const s = suburb.trim().toLowerCase();
  const inZones = zones.some((z) => z.trim().toLowerCase() === s);
  const inCities = cities.some((c) => c.trim().toLowerCase() === s);
  return inZones || inCities;
}
