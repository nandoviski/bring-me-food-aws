import { Router } from "express";
import { authMiddleware, requireAuth, requireAdmin } from "../middleware/auth";
import {
  getPlatformStats,
  getAllChefs,
  updateUserStatus,
  toggleAdmin,
  getAllOrders,
} from "../controllers/adminController";

const router = Router();

// All admin routes require auth + admin flag
router.use(authMiddleware, requireAuth, requireAdmin);

router.get("/stats", getPlatformStats);
router.get("/chefs", getAllChefs);
router.get("/orders", getAllOrders);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/make-admin", toggleAdmin);

export default router;
