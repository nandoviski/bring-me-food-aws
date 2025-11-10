import { Router } from "express";
import { createOrder, getOrdersByChefId } from "../controllers/orderController";

const router = Router();

router.post("/", createOrder);
router.get("/chef/:chefId", getOrdersByChefId);

export default router;
