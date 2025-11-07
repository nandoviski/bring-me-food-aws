import { Router } from "express";
import { getCustomer, updateCustomer, getCustomerOrders } from "../controllers/customerController";

const router = Router();

router.put("/:userId", updateCustomer);
router.get("/:userId", getCustomer);
router.get("/:userId/orders", getCustomerOrders);

export default router;
