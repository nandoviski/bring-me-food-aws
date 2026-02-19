import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import { createMenu, updateMenu, getMenusByChef, deleteMenu, distributeMenu } from "../controllers/menuController";

const router = Router();

router.post("/", requireAuth, requireChef, createMenu);
router.put("/:menuId", requireAuth, requireChef, updateMenu);
router.delete("/:menuId", requireAuth, requireChef, deleteMenu);
router.get("/:chefId/byChef", getMenusByChef);
router.post("/:menuId/distribute", requireAuth, requireChef, distributeMenu);

export default router;
