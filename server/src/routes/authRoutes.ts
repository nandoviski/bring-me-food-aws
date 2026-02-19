import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { signup, signin, me } from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", requireAuth, me);

export default router;
