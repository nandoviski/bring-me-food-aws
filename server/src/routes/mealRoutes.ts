import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import { createMeal, getMealsByChef, updateMeal } from "../controllers/mealController";

const router = Router();

router.post("/", requireAuth, requireChef, createMeal);
router.put("/:mealId", requireAuth, requireChef, updateMeal);
router.get("/:chefId/byChef", getMealsByChef);

export default router;
