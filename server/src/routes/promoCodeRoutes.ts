import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import {
  createPromoCode,
  listPromoCodes,
  deactivatePromoCode,
  validatePromoCode,
} from "../controllers/promoCodeController";

const router = Router();

// Public: validate a promo code at checkout
router.post("/validate", validatePromoCode);

// Chef-only: manage promo codes
router.get("/", requireAuth, requireChef, listPromoCodes);
router.post("/", requireAuth, requireChef, createPromoCode);
router.patch("/:codeId/deactivate", requireAuth, requireChef, deactivatePromoCode);

export default router;
