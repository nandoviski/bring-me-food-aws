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
} from "../controllers/adminController";

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

export default router;
