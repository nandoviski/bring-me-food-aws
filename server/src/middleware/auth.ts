import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/jwt";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isChef: boolean;
    isAdmin: boolean;
  };
}

/**
 * Permissive middleware — attaches user to req if token is valid, otherwise continues.
 * Does not block requests without a token (for public endpoints).
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer\s+(.+)$/);
    if (!match) return next();

    const payload = verifyToken(match[1]);

    // Re-check isChef from DB to prevent stale JWT data
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { chef: true },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        isChef: !!user.chef,
        isAdmin: user.isAdmin,
      };
    }
  } catch {
    // Invalid/expired token — continue as unauthenticated
  }
  next();
}

/** Require a valid authenticated session. Returns 401 otherwise. */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  next();
}

/** Require the user to be a chef. Returns 403 otherwise. */
export function requireChef(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user?.isChef) {
    return res.status(403).json({ success: false, message: "Chef access required" });
  }
  next();
}

/** Require the user to be a platform admin. Returns 403 otherwise. */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

/** Require the user to be a customer. Returns 403 otherwise. */
export function requireCustomer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user || req.user.isChef) {
    return res.status(403).json({ success: false, message: "Customer access required" });
  }
  next();
}
