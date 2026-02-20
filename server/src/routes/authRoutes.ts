import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { signup, signin, me, resetPassword } from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, me);

export default router;
