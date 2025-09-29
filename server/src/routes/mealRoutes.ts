import { Router } from "express";
import { createMeal, getMeals } from "../controllers/mealController";

const router = Router();

router.get("/", getMeals);
router.post("/", createMeal);

export default router;
