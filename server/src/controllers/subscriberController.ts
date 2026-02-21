import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Validates an E.164 phone number (e.g. +61412345678).
 * Accepts with or without spaces — normalises to E.164 before save.
 */
function normalisePhone(raw: string): string {
  return raw.replace(/\s+/g, "");
}

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1).max(150).optional(),
  /** Optional mobile number for SMS distribution. Must be E.164 (e.g. +61412345678). */
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "Phone must be in E.164 format (e.g. +61412345678)")
    .optional(),
});

/**
 * POST /subscribers/:chefId
 * Subscribe to a chef's menu emails.
 */
export async function subscribe(req: Request, res: Response) {
  try {
    const { chefId } = req.params;
    const payload = subscribeSchema.parse(req.body);

    const chef = await prisma.chef.findUnique({ where: { id: chefId } });
    if (!chef) return res.status(404).json({ message: "Chef not found" });

    const phone = payload.phone ? normalisePhone(payload.phone) : undefined;

    // Upsert: if they previously unsubscribed, re-subscribe them
    const subscriber = await prisma.subscriber.upsert({
      where: { email_chefId: { email: payload.email, chefId } },
      create: {
        email: payload.email,
        name: payload.name,
        phone,
        chefId,
        unsubscribed: false,
        smsOptedOut: false,
      },
      update: {
        unsubscribed: false,
        name: payload.name ?? undefined,
        // Update phone if provided; don't clear an existing phone if not included
        ...(phone !== undefined ? { phone, smsOptedOut: false } : {}),
      },
    });

    return res.status(200).json({
      message: "Subscribed successfully",
      id: subscriber.id,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", errors: err.issues });
    }
    console.error("subscribe error", err);
    return res.status(500).json({ message: "Error subscribing" });
  }
}

/**
 * GET /subscribers/:chefId/unsubscribe
 * Unsubscribe from a chef's menu emails (via email link).
 * Redirects to frontend success page.
 */
export async function unsubscribe(req: Request, res: Response) {
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  try {
    const { chefId } = req.params;
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.redirect(`${appBaseUrl}/unsubscribed?status=error`);
    }

    // Get chef username for the success page
    const chef = await prisma.chef.findUnique({ where: { id: chefId }, select: { username: true } });

    await prisma.subscriber.updateMany({
      where: { email, chefId },
      data: { unsubscribed: true },
    });

    return res.redirect(
      `${appBaseUrl}/unsubscribed?chef=${encodeURIComponent(chef?.username ?? "")}&email=${encodeURIComponent(email)}`
    );
  } catch (err) {
    console.error("unsubscribe error", err);
    return res.redirect(`${appBaseUrl}/unsubscribed?status=error`);
  }
}

/**
 * GET /subscribers/:chefId
 * List subscribers for a chef (chef-only).
 */
export async function listSubscribers(req: Request, res: Response) {
  try {
    const { chefId } = req.params;

    const subscribers = await prisma.subscriber.findMany({
      where: { chefId, unsubscribed: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, phone: true, smsOptedOut: true, createdAt: true },
    });

    return res.status(200).json({ count: subscribers.length, subscribers });
  } catch (err) {
    console.error("listSubscribers error", err);
    return res.status(500).json({ message: "Error fetching subscribers" });
  }
}

/**
 * GET /subscribers/:chefId/sms-optout
 * Handle STOP reply / SMS opt-out link.
 * Marks smsOptedOut=true for a subscriber by phone number.
 * Redirects to a frontend page.
 */
export async function smsOptOut(req: Request, res: Response) {
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  try {
    const { chefId } = req.params;
    const { phone } = req.query;

    if (!phone || typeof phone !== "string") {
      return res.redirect(`${appBaseUrl}/unsubscribed?status=error&channel=sms`);
    }

    await prisma.subscriber.updateMany({
      where: { chefId, phone: normalisePhone(phone) },
      data: { smsOptedOut: true },
    });

    return res.redirect(`${appBaseUrl}/unsubscribed?channel=sms`);
  } catch (err) {
    console.error("smsOptOut error", err);
    return res.redirect(`${appBaseUrl}/unsubscribed?status=error&channel=sms`);
  }
}
