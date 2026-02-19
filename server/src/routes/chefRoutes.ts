import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import {
  getChefByUsername,
  getChefsWeeklyMenu,
  updateChef,
  getChefByUserId,
  checkChefUsernameExists,
  getChefStats,
  getAllChefs,
} from "../controllers/chefController";

const router = Router();

// Public: list/search all chefs
router.get("/", getAllChefs);

router.put("/:chefId", requireAuth, requireChef, updateChef);
router.get("/byUserId/:userId", getChefByUserId);
router.get("/:chefId/stats", requireAuth, requireChef, getChefStats);
router.get("/:chefId/menu", getChefsWeeklyMenu);
router.get("/:username/profile", getChefByUsername);
router.get("/:username/exists", checkChefUsernameExists);

export default router;
