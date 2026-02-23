"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { LayoutDashboard, Users, ShoppingCart, LogOut, ChefHat, Mail, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/chefs", label: "Chefs", icon: ChefHat },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2 border-b px-4 py-5">
        <span className="text-lg font-bold text-orange-500">BMF</span>
        <span className="text-sm font-semibold text-gray-700">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <p className="mb-2 truncate px-3 text-xs text-gray-400">{user?.email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-gray-500"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthGuard({ requireAdmin: true, redirectTo: "/" });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
