import { Router } from "express";
import express from "express";
import { createCheckoutSession, handleStripeWebhook } from "../controllers/paymentController";

const router = Router();

// POST /api/orders/:orderId/checkout — create Stripe Checkout session
// No auth required — we look up the order by ID; the orderId acts as a token
router.post("/:orderId/checkout", createCheckoutSession);

export default router;

// Separate router for Stripe webhook — needs raw body
export const stripeWebhookRouter = Router();
stripeWebhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);
