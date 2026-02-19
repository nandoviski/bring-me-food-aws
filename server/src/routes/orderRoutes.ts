import { Router } from "express";
import { requireAuth, requireChef, requireCustomer } from "../middleware/auth";
import { createOrder, getOrdersByChefId, updateOrderStatus } from "../controllers/orderController";

const router = Router();

router.post("/", requireAuth, requireCustomer, createOrder);
router.get("/chef/:chefId", requireAuth, requireChef, getOrdersByChefId);
router.patch("/:orderId/status", requireAuth, requireChef, updateOrderStatus);

export default router;
