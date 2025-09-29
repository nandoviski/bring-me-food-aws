import { Router } from "express";
import { getCustomer, updateCustomer } from "../controllers/customerController";

const router = Router();

router.put("/:userId", updateCustomer);
router.get("/:userId", getCustomer);

export default router;
