import { Router } from "express";
import { getMenus } from "../controllers/menuController";

const router = Router();

router.get("/", getMenus);
// router.post("/", createMenu);

export default router;
