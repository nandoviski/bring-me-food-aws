"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Menu,
  ShoppingCart,
  User,
} from "lucide-react";

export function ChefSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/account/chef/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Meals",
      href: "/account/chef/meals",
      icon: UtensilsCrossed,
    },
    {
      label: "Menus",
      href: "/account/chef/menus",
      icon: Menu,
    },
    {
      label: "Orders",
      href: "/account/chef/orders",
      icon: ShoppingCart,
    },
    {
      label: "Profile",
      href: "/account/chef/profile",
      icon: User,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="bg-primary flex h-screen w-64 flex-col text-white shadow-lg">
      <div className="flex items-center gap-3 border-b border-green-600 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <UtensilsCrossed className="h-6 w-6 text-green-800" />
        </div>
        <h1 className="text-xl font-bold">Chef Hub</h1>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                active
                  ? "bg-green-800 text-white shadow-md"
                  : "text-green-100 hover:bg-green-600 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-green-600 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-green-100">
          <div className="h-8 w-8 rounded-full bg-green-600" />
          <div>
            <p className="font-medium">Chef Account</p>
            <p className="text-xs text-green-200">View profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
