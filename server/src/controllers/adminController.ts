import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth";

const prisma = new PrismaClient();

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
export const getPlatformStats = async (
  _req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalChefs,
      totalCustomers,
      totalOrders,
      pendingOrders,
      ordersThisWeek,
      ordersThisMonth,
      totalSubscribers,
      revenueAll,
      revenueWeek,
      revenueMonth,
      recentChefs,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.chef.count({ where: { deletedAt: null } }),
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.subscriber.count({ where: { unsubscribed: false } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", createdAt: { gte: startOfWeek } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
      }),
      // Last 5 chefs to join
      prisma.chef.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, username: true, location: true, createdAt: true },
      }),
      // Last 5 orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          total: true,
          guestName: true,
          createdAt: true,
          chef: { select: { name: true, username: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        users: { total: totalUsers, chefs: totalChefs, customers: totalCustomers },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          thisWeek: ordersThisWeek,
          thisMonth: ordersThisMonth,
        },
        revenue: {
          total: revenueAll._sum.total ?? 0,
          thisWeek: revenueWeek._sum.total ?? 0,
          thisMonth: revenueMonth._sum.total ?? 0,
        },
        subscribers: { total: totalSubscribers },
      },
      recentChefs,
      recentOrders,
    });
  } catch (err) {
    console.error("getPlatformStats error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// ─── GET /api/admin/chefs ────────────────────────────────────────────────────
export const getAllChefs = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          deletedAt: null,
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { username: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : { deletedAt: null };

    const [chefs, total] = await Promise.all([
      prisma.chef.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, status: true, isAdmin: true, createdAt: true } },
          _count: { select: { order: true, subscribers: true, meals: true } },
        },
      }),
      prisma.chef.count({ where }),
    ]);

    // Fetch revenue per chef
    const chefIds = chefs.map((c) => c.id);
    const revenues = await prisma.order.groupBy({
      by: ["chefId"],
      where: { chefId: { in: chefIds }, paymentStatus: "PAID" },
      _sum: { total: true },
    });
    const revenueMap: Record<string, number> = {};
    for (const r of revenues) {
      revenueMap[r.chefId] = r._sum.total ?? 0;
    }

    const enriched = chefs.map((c) => ({
      id: c.id,
      name: c.name,
      username: c.username,
      location: c.location,
      profileImage: c.profileImage,
      deliveryMode: c.deliveryMode,
      featured: c.featured,
      createdAt: c.createdAt,
      user: c.user,
      stats: {
        orders: c._count.order,
        subscribers: c._count.subscribers,
        meals: c._count.meals,
        revenue: revenueMap[c.id] ?? 0,
      },
    }));

    return res.json({
      success: true,
      chefs: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getAllChefs error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch chefs" });
  }
};

// ─── PATCH /api/admin/users/:id/status ──────────────────────────────────────
export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// ─── PATCH /api/admin/users/:id/make-admin ──────────────────────────────────
export const toggleAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ success: false, message: "isAdmin must be a boolean" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const updated = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: { id: true, email: true, isAdmin: true },
    });

    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error("toggleAdmin error:", err);
    return res.status(500).json({ success: false, message: "Failed to update admin flag" });
  }
};

// ─── GET /api/admin/orders ──────────────────────────────────────────────────
export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;
    const paymentStatus = req.query.paymentStatus as string;
    const chefId = req.query.chefId as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (chefId) where.chefId = chefId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          chef: { select: { id: true, name: true, username: true } },
          customer: {
            select: { firstName: true, lastName: true, user: { select: { email: true } } },
          },
          mealsOnOrders: {
            select: { quantity: true, priceAtPurchase: true, meal: { select: { name: true } } },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ─── GET /api/admin/revenue-trend ────────────────────────────────────────────
export const getRevenueTrend = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const days = Math.min(90, parseInt(req.query.days as string) || 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate }, paymentStatus: "PAID" },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const dateMap: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dateMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (key in dateMap) {
        dateMap[key] += order.total;
      }
    }

    const trend = Object.entries(dateMap).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));

    return res.json({ success: true, trend, days });
  } catch (err) {
    console.error("getRevenueTrend error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch revenue trend" });
  }
};

// ─── PATCH /api/admin/chefs/:id/featured ─────────────────────────────────────
export const toggleFeatured = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== "boolean") {
      return res.status(400).json({ success: false, message: "featured must be a boolean" });
    }

    const chef = await prisma.chef.findUnique({ where: { id } });
    if (!chef) return res.status(404).json({ success: false, message: "Chef not found" });

    const updated = await prisma.chef.update({
      where: { id },
      data: { featured },
      select: { id: true, name: true, featured: true },
    });

    return res.json({ success: true, chef: updated });
  } catch (err) {
    console.error("toggleFeatured error:", err);
    return res.status(500).json({ success: false, message: "Failed to update featured status" });
  }
};

// ─── GET /api/admin/subscribers ──────────────────────────────────────────────
export const getAllSubscribers = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const chefId = req.query.chefId as string;
    const exportCsv = req.query.export === "csv";
    const skip = (page - 1) * limit;

    const where = {
      ...(chefId ? { chefId } : {}),
    };

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        skip: exportCsv ? undefined : skip,
        take: exportCsv ? undefined : limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          unsubscribed: true,
          createdAt: true,
          chef: { select: { id: true, name: true, username: true } },
        },
      }),
      prisma.subscriber.count({ where }),
    ]);

    if (exportCsv) {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const rows = [
        ["Email", "Chef Name", "Chef Username", "Subscribed At", "Unsubscribed"],
        ...subscribers.map((s) => [
          escape(s.email),
          escape(s.chef?.name ?? ""),
          escape(s.chef?.username ?? ""),
          escape(new Date(s.createdAt).toISOString()),
          escape(s.unsubscribed ? "Yes" : "No"),
        ]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="subscribers-${new Date().toISOString().slice(0,10)}.csv"`);
      return res.send(csv);
    }

    return res.json({
      success: true,
      subscribers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getAllSubscribers error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch subscribers" });
  }
};
