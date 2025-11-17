import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthGuardOptions = {
  requireChef?: boolean;
  requireCustomer?: boolean;
  redirectTo?: string;
};

/**
 * Hook to protect pages/components with auth checks
 * Redirects if user is not logged in or doesn't have required role
 *
 * Usage:
 * export default function ChefDashboard() {
 *   const { user, isLoading } = useAuthGuard({ requireChef: true });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   return <div>Welcome {user?.email}</div>;
 * }
 */
export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const {
    requireChef = false,
    requireCustomer = false,
    redirectTo = "/",
  } = options;

  useEffect(() => {
    // Don't redirect while loading (avoid race conditions)
    if (isLoading) return;

    // Check if user is logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements
    if (requireChef && !user.isChef) {
      router.push(redirectTo);
      return;
    }

    if (requireCustomer && user.isChef) {
      router.push(redirectTo);
      return;
    }
  }, [user, isLoading, requireChef, requireCustomer, router, redirectTo]);

  return { user, isLoading };
}
