import { Router } from "express";
import {
  getChefByUsername,
  getChefsWeeklyMenu,
  updateChef,
  getChefByUserId,
  checkChefUsernameExists,
} from "../controllers/chefController";

const router = Router();

router.put("/:chefId", updateChef);
router.get("/:username/profile", getChefByUsername);
router.get("/:username/exists", checkChefUsernameExists);
router.get("/:chefId/menu", getChefsWeeklyMenu);
router.get("/byUserId/:userId", getChefByUserId);

export default router;
