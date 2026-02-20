import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { signup, signin, me, forgotPassword, resetPassword } from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, me);

export default router;
