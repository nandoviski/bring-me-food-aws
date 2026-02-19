import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1).max(150).optional(),
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

    // Upsert: if they previously unsubscribed, re-subscribe them
    const subscriber = await prisma.subscriber.upsert({
      where: { email_chefId: { email: payload.email, chefId } },
      create: { email: payload.email, name: payload.name, chefId, unsubscribed: false },
      update: { unsubscribed: false, name: payload.name ?? undefined },
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
 * DELETE /subscribers/:chefId
 * Unsubscribe from a chef's menu emails (by token or email).
 */
export async function unsubscribe(req: Request, res: Response) {
  try {
    const { chefId } = req.params;
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "email query param required" });
    }

    await prisma.subscriber.updateMany({
      where: { email, chefId },
      data: { unsubscribed: true },
    });

    return res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (err) {
    console.error("unsubscribe error", err);
    return res.status(500).json({ message: "Error unsubscribing" });
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
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return res.status(200).json({ count: subscribers.length, subscribers });
  } catch (err) {
    console.error("listSubscribers error", err);
    return res.status(500).json({ message: "Error fetching subscribers" });
  }
}
