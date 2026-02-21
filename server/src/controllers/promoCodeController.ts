import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────────────────────

const createPromoSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(30, "Code must be 30 characters or less")
    .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, underscores, and hyphens")
    .transform((s) => s.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  discountValue: z
    .number()
    .positive("Discount must be a positive number")
    .max(100, "Percentage discount cannot exceed 100"),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

const validatePromoSchema = z.object({
  code: z.string().min(1),
  chefId: z.string().uuid(),
  orderTotal: z.number().positive(), // before discount
});

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function calcDiscount(total: number, type: "PERCENTAGE" | "FIXED", value: number): number {
  if (type === "PERCENTAGE") {
    return Math.round((total * (value / 100)) * 100) / 100;
  }
  return Math.min(value, total); // never discount more than the total
}

// ────────────────────────────────────────────────────────────────────────────
// Endpoints
// ────────────────────────────────────────────────────────────────────────────

/**
 * POST /promo-codes
 * Create a promo code for the authenticated chef.
 */
export async function createPromoCode(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chef = await prisma.chef.findFirst({ where: { userId } });
    if (!chef) return res.status(403).json({ message: "Chef account not found" });

    const payload = createPromoSchema.parse(req.body);

    // Disallow PERCENTAGE > 100
    if (payload.discountType === "PERCENTAGE" && payload.discountValue > 100) {
      return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
    }

    // Check uniqueness
    const existing = await prisma.promoCode.findUnique({
      where: { code_chefId: { code: payload.code, chefId: chef.id } },
    });
    if (existing) {
      return res.status(409).json({ message: `Code "${payload.code}" already exists for your account` });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: payload.code,
        chefId: chef.id,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        maxUses: payload.maxUses,
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
      },
    });

    return res.status(201).json(promo);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", errors: err.issues });
    }
    console.error("createPromoCode error", err);
    return res.status(500).json({ message: "Error creating promo code" });
  }
}

/**
 * GET /promo-codes
 * List all promo codes for the authenticated chef.
 */
export async function listPromoCodes(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chef = await prisma.chef.findFirst({ where: { userId } });
    if (!chef) return res.status(403).json({ message: "Chef account not found" });

    const codes = await prisma.promoCode.findMany({
      where: { chefId: chef.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ codes });
  } catch (err) {
    console.error("listPromoCodes error", err);
    return res.status(500).json({ message: "Error fetching promo codes" });
  }
}

/**
 * PATCH /promo-codes/:codeId/deactivate
 * Deactivate a promo code (chef-only, owns the code).
 */
export async function deactivatePromoCode(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chef = await prisma.chef.findFirst({ where: { userId } });
    if (!chef) return res.status(403).json({ message: "Chef account not found" });

    const { codeId } = req.params;
    const promo = await prisma.promoCode.findFirst({
      where: { id: codeId, chefId: chef.id },
    });
    if (!promo) return res.status(404).json({ message: "Promo code not found" });

    const updated = await prisma.promoCode.update({
      where: { id: codeId },
      data: { active: false },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("deactivatePromoCode error", err);
    return res.status(500).json({ message: "Error deactivating promo code" });
  }
}

/**
 * POST /promo-codes/validate
 * Public endpoint — validate a promo code for a given chefId + order total.
 * Returns discount info if valid.
 */
export async function validatePromoCode(req: Request, res: Response) {
  try {
    const payload = validatePromoSchema.parse(req.body);

    const promo = await prisma.promoCode.findUnique({
      where: { code_chefId: { code: payload.code.toUpperCase(), chefId: payload.chefId } },
    });

    if (!promo) {
      return res.status(404).json({ valid: false, message: "Invalid promo code" });
    }

    if (!promo.active) {
      return res.status(400).json({ valid: false, message: "This promo code is no longer active" });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return res.status(400).json({ valid: false, message: "This promo code has expired" });
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ valid: false, message: "This promo code has reached its maximum uses" });
    }

    const discountAmount = calcDiscount(payload.orderTotal, promo.discountType as any, promo.discountValue);

    return res.status(200).json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalTotal: Math.round((payload.orderTotal - discountAmount) * 100) / 100,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ valid: false, message: "Invalid payload", errors: err.issues });
    }
    console.error("validatePromoCode error", err);
    return res.status(500).json({ valid: false, message: "Error validating promo code" });
  }
}
