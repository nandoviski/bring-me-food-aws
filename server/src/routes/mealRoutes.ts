import { Router } from "express";
import { createMeal, getMeals, getMealsByChef, updateMeal } from "../controllers/mealController";

const router = Router();

router.get("/", getMeals);
router.post("/", createMeal);
router.put("/:mealId", updateMeal);
router.get("/:chefId/byChef", getMealsByChef);

export default router;
