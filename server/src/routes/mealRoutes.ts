import { Router } from "express";
import { createMeal, getMealsByChef, updateMeal } from "../controllers/mealController";

const router = Router();

router.post("/", createMeal);
router.put("/:mealId", updateMeal);
router.get("/:chefId/byChef", getMealsByChef);

export default router;
