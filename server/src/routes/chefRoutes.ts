import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import {
  getChefByUsername,
  getChefsWeeklyMenu,
  updateChef,
  getChefByUserId,
  checkChefUsernameExists,
} from "../controllers/chefController";

const router = Router();

router.put("/:chefId", requireAuth, requireChef, updateChef);
router.get("/:username/profile", getChefByUsername);
router.get("/:username/exists", checkChefUsernameExists);
router.get("/:chefId/menu", getChefsWeeklyMenu);
router.get("/byUserId/:userId", getChefByUserId);

export default router;
