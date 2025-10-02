import { Router } from "express";
import { createMenu, updateMenu, getMenusByChef, deleteMenu } from "../controllers/menuController";

const router = Router();

router.post("/", createMenu);
router.put("/:menuId", updateMenu);
router.get("/:chefId/byChef", getMenusByChef);
router.delete("/:menuId", deleteMenu);

export default router;
