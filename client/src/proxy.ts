import { NextRequest, NextResponse } from "next/server";
import { SESSION_KEY } from "./lib/constants";

const protectedRoutes = ["/account"];
const chefOnlyRoutes = ["/account/chef"];
const customerOnlyRoutes = ["/account/customer", "/checkout"];
const publicRoutes = ["/", "/how-it-works", "/search", "/chef"];

/**
 * Proxy for route protection
 * Default: Deny access unless explicitly public
 * Exceptions: Public routes and authenticated routes
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Get session from cookie
  const sessionCookie = request.cookies.get(SESSION_KEY)?.value;
  let sessionData: any = null;

  try {
    if (sessionCookie) {
      sessionData = JSON.parse(sessionCookie);
    }
  } catch (err) {
    // Invalid session cookie, treat as no session
  }

  // Check if route is in public routes list (or is a public chef profile page)
  const isPublicRoute =
    publicRoutes.some(
      (route) => path === route || path.startsWith(route + "/"),
    ) && !path.startsWith("/account");

  // If route is public, allow access regardless of auth
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // All other routes require login
  if (!sessionData) {
    // Redirect unauthenticated users to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check role-based access
  const isChefRoute = chefOnlyRoutes.some((route) => path.startsWith(route));
  const isCustomerRoute = customerOnlyRoutes.some((route) =>
    path.startsWith(route),
  );

  // Prevent non-chefs from accessing chef routes
  if (isChefRoute && !sessionData.isChef) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Prevent chefs from accessing customer routes
  if (isCustomerRoute && sessionData.isChef) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which routes proxy runs on
export const config = {
  matcher: [
    // Exclude API routes, static files, and images
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
