import { Router } from "express";
import { authMiddleware, requireAuth, requireAdmin } from "../middleware/auth";
import {
  getPlatformStats,
  getAllChefs,
  updateUserStatus,
  toggleAdmin,
  getAllOrders,
  getRevenueTrend,
  toggleFeatured,
  getAllSubscribers,
} from "../controllers/adminController";
import {
  adminListReviews,
  adminToggleReviewVisibility,
  adminDeleteReview,
} from "../controllers/reviewController";

const router = Router();

// All admin routes require auth + admin flag
router.use(authMiddleware, requireAuth, requireAdmin);

router.get("/stats", getPlatformStats);
router.get("/chefs", getAllChefs);
router.get("/orders", getAllOrders);
router.get("/revenue-trend", getRevenueTrend);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/make-admin", toggleAdmin);
router.patch("/chefs/:id/featured", toggleFeatured);
router.get("/subscribers", getAllSubscribers);

// Reviews
router.get("/reviews", adminListReviews);
router.patch("/reviews/:id/visibility", adminToggleReviewVisibility);
router.delete("/reviews/:id", adminDeleteReview);

export default router;
