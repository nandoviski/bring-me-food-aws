import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────────────────────

const createReviewSchema = z.object({
  chefId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  authorName: z.string().min(1).max(150).optional(), // used for guest reviews
});

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function calcAggregates(reviews: { rating: number }[]) {
  const visible = reviews.filter((r: any) => !r.hidden);
  if (!visible.length) return { averageRating: null, reviewCount: 0 };
  const avg = visible.reduce((sum, r) => sum + r.rating, 0) / visible.length;
  return {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: visible.length,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Public: GET /api/reviews/:chefId
// ────────────────────────────────────────────────────────────────────────────

export async function getChefReviews(req: Request, res: Response) {
  try {
    const { chefId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { chefId, hidden: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          authorName: true,
          createdAt: true,
          orderId: true,
        },
      }),
      prisma.review.count({ where: { chefId, hidden: false } }),
    ]);

    // Aggregate stats (all non-hidden reviews for this chef)
    const allRatings = await prisma.review.findMany({
      where: { chefId, hidden: false },
      select: { rating: true },
    });

    const { averageRating, reviewCount } = calcAggregates(allRatings);

    // Distribution
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: allRatings.filter((r) => r.rating === star).length,
    }));

    return res.json({
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: { averageRating, reviewCount, distribution },
    });
  } catch (err) {
    console.error("getChefReviews error:", err);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Public: POST /api/reviews — create a review
// ────────────────────────────────────────────────────────────────────────────

export async function createReview(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const payload = createReviewSchema.parse(req.body);

    // Verify chef exists
    const chef = await prisma.chef.findUnique({ where: { id: payload.chefId } });
    if (!chef) return res.status(404).json({ message: "Chef not found" });

    // If orderId provided, validate the order belongs to this chef and isn't already reviewed
    if (payload.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: payload.orderId },
        include: { review: true },
      });

      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.chefId !== payload.chefId)
        return res.status(400).json({ message: "Order does not belong to this chef" });
      if (order.status !== "DELIVERED" && order.status !== "CONFIRMED")
        return res.status(400).json({ message: "You can only review after an order is confirmed or delivered" });
      if (order.review)
        return res.status(409).json({ message: "This order has already been reviewed" });

      // If logged in, verify order belongs to this customer
      if (userId) {
        const customer = await prisma.customer.findFirst({ where: { userId } });
        if (customer && order.customerId && order.customerId !== customer.id) {
          return res.status(403).json({ message: "This order doesn't belong to you" });
        }
      }
    } else if (userId) {
      // No orderId: check for existing review by this customer for this chef
      const customer = await prisma.customer.findFirst({ where: { userId } });
      if (customer) {
        const existing = await prisma.review.findFirst({
          where: { chefId: payload.chefId, customerId: customer.id },
        });
        if (existing)
          return res.status(409).json({ message: "You have already reviewed this chef" });
      }
    }

    // Resolve author info
    let customerId: string | null = null;
    let authorName = payload.authorName || "Anonymous";

    if (userId) {
      const customer = await prisma.customer.findFirst({ where: { userId } });
      if (customer) {
        customerId = customer.id;
        // Get first name from customer record
        const user = await prisma.user.findUnique({ where: { id: userId } });
        authorName = customer.firstName || user?.username || "Customer";
      }
    }

    const review = await prisma.review.create({
      data: {
        chefId: payload.chefId,
        orderId: payload.orderId || null,
        customerId,
        authorName,
        rating: payload.rating,
        comment: payload.comment || null,
      },
    });

    return res.status(201).json({ review });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ message: "Invalid input", errors: err.errors });
    }
    console.error("createReview error:", err);
    return res.status(500).json({ message: "Failed to create review" });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Chef: GET /api/reviews/mine — chef views their own reviews (all incl. hidden)
// ────────────────────────────────────────────────────────────────────────────

export async function getMyReviews(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const chef = await prisma.chef.findFirst({ where: { userId } });
    if (!chef) return res.status(403).json({ message: "Chef account not found" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { chefId: chef.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { chefId: chef.id } }),
    ]);

    const allRatings = await prisma.review.findMany({
      where: { chefId: chef.id, hidden: false },
      select: { rating: true },
    });

    const { averageRating, reviewCount } = calcAggregates(allRatings);

    return res.json({
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: { averageRating, reviewCount },
    });
  } catch (err) {
    console.error("getMyReviews error:", err);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Admin: GET /api/admin/reviews — all reviews (paginated, filterable)
// ────────────────────────────────────────────────────────────────────────────

export async function adminListReviews(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const hidden = req.query.hidden === "true" ? true : req.query.hidden === "false" ? false : undefined;

    const where: any = {};
    if (hidden !== undefined) where.hidden = hidden;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          chef: { select: { id: true, name: true, username: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return res.json({
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("adminListReviews error:", err);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Admin: PATCH /api/admin/reviews/:id/visibility — hide/show a review
// ────────────────────────────────────────────────────────────────────────────

export async function adminToggleReviewVisibility(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { hidden } = z.object({ hidden: z.boolean() }).parse(req.body);

    const review = await prisma.review.update({
      where: { id },
      data: { hidden },
    });

    return res.json({ review });
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ message: "Review not found" });
    console.error("adminToggleReviewVisibility error:", err);
    return res.status(500).json({ message: "Failed to update review" });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Admin: DELETE /api/admin/reviews/:id
// ────────────────────────────────────────────────────────────────────────────

export async function adminDeleteReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    return res.json({ message: "Review deleted" });
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ message: "Review not found" });
    console.error("adminDeleteReview error:", err);
    return res.status(500).json({ message: "Failed to delete review" });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Public: GET /api/reviews/:chefId/can-review?orderId=...
// Checks if the current user (or guest) can review this chef/order
// ────────────────────────────────────────────────────────────────────────────

export async function canReview(req: Request, res: Response) {
  try {
    const { chefId } = req.params;
    const { orderId } = req.query as { orderId?: string };
    const userId = (req as any).user?.id;

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { review: true },
      });
      if (!order) return res.json({ canReview: false, reason: "Order not found" });
      if (order.chefId !== chefId) return res.json({ canReview: false, reason: "Order mismatch" });
      if (order.review) return res.json({ canReview: false, reason: "Already reviewed" });
      if (order.status !== "DELIVERED" && order.status !== "CONFIRMED")
        return res.json({ canReview: false, reason: "Order not yet delivered" });
      return res.json({ canReview: true });
    }

    // No orderId — check if logged-in customer already reviewed this chef
    if (userId) {
      const customer = await prisma.customer.findFirst({ where: { userId } });
      if (customer) {
        const existing = await prisma.review.findFirst({
          where: { chefId, customerId: customer.id },
        });
        if (existing) return res.json({ canReview: false, reason: "Already reviewed" });
      }
    }

    return res.json({ canReview: true });
  } catch (err) {
    console.error("canReview error:", err);
    return res.status(500).json({ message: "Failed to check review eligibility" });
  }
}
