import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import { subscribe, unsubscribe, listSubscribers, smsOptOut } from "../controllers/subscriberController";

const router = Router();

// Public: anyone can subscribe to a chef
router.post("/:chefId", subscribe);

// Public: unsubscribe via email link
router.get("/:chefId/unsubscribe", unsubscribe);

// Public: opt out of SMS via link in text message
router.get("/:chefId/sms-optout", smsOptOut);

// Chef-only: view their subscriber list
router.get("/:chefId", requireAuth, requireChef, listSubscribers);

export default router;
