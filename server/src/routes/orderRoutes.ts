import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import { createOrder, getOrdersByChefId, updateOrderStatus, getOrderTrackingById } from "../controllers/orderController";

const router = Router();

// POST /orders — allows both authenticated customers and guests (no auth middleware)
// Global authMiddleware still runs and attaches req.user if a token is present
router.post("/", createOrder);
router.get("/chef/:chefId", requireAuth, requireChef, getOrdersByChefId);
router.get("/:orderId/track", getOrderTrackingById); // Public order tracking — no auth
router.patch("/:orderId/status", requireAuth, requireChef, updateOrderStatus);

export default router;
