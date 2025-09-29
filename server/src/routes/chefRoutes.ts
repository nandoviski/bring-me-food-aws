import { Router } from "express";
import { getChefByUsername, getChefsWeeklyMenu, updateChef, getChefByUserId } from "../controllers/chefController";

const router = Router();

router.put("/:chefId", updateChef);
router.get("/:username/profile", getChefByUsername);
router.get("/:chefId/menu", getChefsWeeklyMenu);
router.get("/byUserId/:userId", getChefByUserId);

export default router;
