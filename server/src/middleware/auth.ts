import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isChef: boolean;
  };
}

/**
 * Middleware to verify session from cookie
 * Attaches user info to req.user if valid
 * This is permissive - it doesn't fail if there's no session
 *
 * Usage: app.use(authMiddleware);
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get session from cookie
    const cookies = parseCookies(req.headers.cookie || "");
    const sessionStr = cookies.session;

    if (!sessionStr) {
      return next(); // Continue without user (public endpoint)
    }

    const session = JSON.parse(decodeURIComponent(sessionStr));

    if (session && session.id && session.email) {
      req.user = {
        id: session.id,
        email: session.email,
        isChef: session.isChef || false,
      };
    }

    next();
  } catch (err) {
    // Invalid session, continue without user
    next();
  }
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not logged in
 *
 * Usage: router.post("/meals", requireAuth, createMeal);
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
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
export function requireChef(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
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
export function requireCustomer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.isChef) {
    return res.status(403).json({
      success: false,
      message: "Customer access required",
    });
  }
  next();
}

/**
 * Helper function to parse cookies from header
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    cookies[name.trim()] = rest.join("=").trim();
  });
  return cookies;
}
