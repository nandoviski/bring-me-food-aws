import { Router } from "express";
import { requireAuth, requireCustomer } from "../middleware/auth";
import { getCustomer, updateCustomer, getCustomerOrders } from "../controllers/customerController";

const router = Router();

router.put("/:userId", requireAuth, updateCustomer);
router.get("/:userId", requireAuth, getCustomer);
router.get("/:userId/orders", requireAuth, requireCustomer, getCustomerOrders);

export default router;
