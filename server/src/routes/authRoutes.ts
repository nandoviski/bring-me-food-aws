import { Router, Response } from "express";
import { syncUser } from "../controllers/authController";

const router = Router();

router.post("/sync-user", syncUser);  // No requireAuth - validate Cognito user via AdminGetUser instead

export default router;
