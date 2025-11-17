"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Menu,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

export function ChefSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors hover:bg-green-800 md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-primary fixed z-40 flex h-full w-64 transform flex-col text-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:h-full ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-green-600 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <UtensilsCrossed className="h-6 w-6 text-green-800" />
          </div>
          <h1 className="text-xl font-bold">Chef Hub</h1>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
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
      </aside>
    </>
  );
}
