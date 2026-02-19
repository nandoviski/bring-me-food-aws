import { Router } from "express";
import { requireAuth, requireChef } from "../middleware/auth";
import { subscribe, unsubscribe, listSubscribers } from "../controllers/subscriberController";

const router = Router();

// Public: anyone can subscribe to a chef
router.post("/:chefId", subscribe);

// Public: unsubscribe via email link
router.get("/:chefId/unsubscribe", unsubscribe);

// Chef-only: view their subscriber list
router.get("/:chefId", requireAuth, requireChef, listSubscribers);

export default router;
