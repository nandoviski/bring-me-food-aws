import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyCognitoToken, extractUserFromToken } from "../utils/cognito-verify";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string; // Database user ID
    email: string;
    isChef: boolean;
    cognitoId?: string; // Cognito user sub
  };
}

/**
 * Middleware to verify Cognito JWT token from Authorization header
 * Attaches user info to req.user if valid
 * This is permissive - it doesn't fail if there's no token
 *
 * Token format: Authorization: Bearer <jwt_token>
 * Usage: app.use(authMiddleware);
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization || "";
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);

    if (!tokenMatch) {
      return next(); // Continue without user (public endpoint)
    }

    const token = tokenMatch[1];

    // Verify Cognito token
    const payload = await verifyCognitoToken(token);
    const userInfo = extractUserFromToken(payload);

    // Look up user in database by email
    const user = await prisma.user.findUnique({
      where: { email: userInfo.email },
      include: {
        chef: true,
        customer: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        isChef: !!user.chef,
        cognitoId: user.cognitoId || undefined,
      };
    } else {
      // User exists in Cognito but not in database yet
      // Store minimal info for sync-user endpoint to use
      req.user = {
        id: userInfo.cognitoId, // Use cognito ID as temporary ID
        email: userInfo.email,
        isChef: false,
        cognitoId: userInfo.cognitoId,
      };
    }

    next();
  } catch (err: any) {
    // Invalid token, continue without user
    // This allows public endpoints to work
    console.warn("Auth middleware error:", err.message);
    console.warn("Auth middleware - Failed to verify token, continuing as public request");
    next();
  }
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not logged in
 *
 * Usage: router.post("/meals", requireAuth, createMeal);
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    console.warn("requireAuth - Authentication required but user is undefined");
    console.warn("Authorization header:", req.headers.authorization);
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  next();
}

/**
 * Middleware to require chef role
 * Returns 403 if user is not a chef
 *
 * Usage: router.post("/meals", requireAuth, requireChef, createMeal);
 */
export function requireChef(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isChef) {
    return res.status(403).json({
      success: false,
      message: "Chef access required",
    });
  }
  next();
}

/**
 * Middleware to require customer role
 * Returns 403 if user is a chef or not logged in
 *
 * Usage: router.post("/orders", requireAuth, requireCustomer, createOrder);
 */
export function requireCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.isChef) {
    return res.status(403).json({
      success: false,
      message: "Customer access required",
    });
  }
  next();
}
