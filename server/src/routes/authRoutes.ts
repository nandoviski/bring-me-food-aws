import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { syncUser } from "../controllers/authController";

const router = Router();

router.post("/sync-user", requireAuth, syncUser);

export default router;
