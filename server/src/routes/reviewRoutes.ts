import { Router } from "express";
import { authMiddleware, requireAuth, requireChef } from "../middleware/auth";
import {
  getChefReviews,
  createReview,
  getMyReviews,
  canReview,
} from "../controllers/reviewController";

const router = Router();

// ── POST /api/reviews ─────────────────────────────────────────────────────────
// Auth optional: post a review (guest or logged-in customer)
router.post("/", authMiddleware, createReview);

// ── Chef-only ─────────────────────────────────────────────────────────────────
// MUST come before /:chefId to avoid "mine" being matched as a chefId
router.get("/mine", requireAuth, requireChef, getMyReviews);

// ── Public per-chef ───────────────────────────────────────────────────────────
// Public: get reviews for a chef (no auth needed)
router.get("/:chefId", getChefReviews);

// Auth optional: can this user/guest review this chef/order?
router.get("/:chefId/can-review", authMiddleware, canReview);

export default router;
