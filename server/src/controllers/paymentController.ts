import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

/**
 * POST /api/orders/:orderId/checkout
 * Creates a Stripe Checkout Session for an existing order.
 * Returns { url } — the Stripe-hosted payment page URL.
 */
export async function createCheckoutSession(req: Request, res: Response) {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
    return res.status(503).json({ message: "Payments not configured — ask the chef to set up Stripe." });
  }

  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        mealsOnOrders: {
          include: { meal: true },
        },
        chef: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ message: "This order has already been paid." });
    }

    // Build line_items from the actual meals
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.mealsOnOrders.map((item) => ({
      price_data: {
        currency: "aud",
        product_data: {
          name: item.meal.name,
          description: item.meal.description || undefined,
        },
        unit_amount: Math.round(item.priceAtPurchase * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Add delivery fee as a separate line item if applicable
    if (order.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: { name: "Delivery fee" },
          unit_amount: Math.round(order.deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        chefId: order.chefId,
      },
      customer_email: order.guestEmail || undefined,
      success_url: `${APP_BASE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order.id}`,
      cancel_url: `${APP_BASE_URL}/checkout?payment_cancelled=1&orderId=${order.id}`,
    });

    // Save the session ID on the order so webhook can look it up
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("[stripe] createCheckoutSession error:", err);
    return res.status(500).json({ message: "Failed to create payment session" });
  }
}

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events. Must receive raw body (not JSON-parsed).
 * Relevant events:
 *   - checkout.session.completed → mark order PAID
 *   - checkout.session.expired   → (no action, order stays PENDING)
 *   - charge.refunded            → mark order REFUNDED
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err: any) {
    console.error("[stripe] Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.warn("[stripe] checkout.session.completed — no orderId in metadata");
          break;
        }

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            stripeSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          },
          include: {
            chef: { include: { user: { select: { email: true } } } },
          },
        });

        console.log(`[stripe] Order ${orderId} marked as PAID (session ${session.id})`);

        // Notify chef by email that payment was received
        const chefEmail = updatedOrder.chef?.user?.email;
        const chefName = updatedOrder.chef?.name ?? "Chef";
        const grandTotal = updatedOrder.total + updatedOrder.deliveryFee;

        if (chefEmail && process.env.RESEND_API_KEY) {
          resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Bring Me Food <no-reply@bringmefood.com>",
            to: chefEmail,
            subject: `💳 Payment received — $${grandTotal.toFixed(2)} for order #${orderId.slice(0, 8)}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 12px; padding: 28px 32px; margin-bottom: 28px; text-align: center;">
                  <p style="margin: 0 0 4px; font-size: 13px; color: rgba(255,255,255,0.8);">Payment confirmed via Stripe</p>
                  <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">💳 $${grandTotal.toFixed(2)} received!</h1>
                </div>
                <p style="color: #555; font-size: 15px;">Hi ${chefName},</p>
                <p style="color: #555; font-size: 15px;">
                  Great news — a customer just paid for their order. You can now confirm and prepare it.
                </p>
                <div style="background: #f9f9f9; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
                  <p style="margin: 0 0 8px; font-size: 13px; color: #888;">Order ID: <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">${orderId.slice(0, 8)}</code></p>
                  <p style="margin: 0; font-size: 18px; font-weight: 700; color: #16a34a;">$${grandTotal.toFixed(2)} confirmed</p>
                </div>
                <a href="${APP_BASE_URL}/account/chef/orders" style="display: inline-block; background: #e85d04; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; margin-top: 8px;">
                  View order in dashboard →
                </a>
                <p style="margin-top: 28px; font-size: 12px; color: #aaa;">Bring Me Food · Payments powered by Stripe</p>
              </div>
            `,
          }).catch((e: any) => console.error("[stripe] Chef payment notification failed:", e));
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

        if (paymentIntentId) {
          const order = await prisma.order.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
          });

          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: "REFUNDED" },
            });
            console.log(`[stripe] Order ${order.id} marked as REFUNDED`);
          }
        }
        break;
      }

      default:
        // Unhandled event — ignore
        break;
    }
  } catch (err) {
    console.error("[stripe] Error processing webhook event:", err);
    return res.status(500).send("Webhook processing error");
  }

  res.json({ received: true });
}
