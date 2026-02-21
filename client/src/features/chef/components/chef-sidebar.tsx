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
  LogOut,
  MessageSquare,
  BookOpen,
  Plus,
  Users,
  Tag,
} from "lucide-react";

export function ChefSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: "Overview",
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
      label: "Order history",
      href: "/account/chef/orders",
      icon: ShoppingCart,
    },
    {
      label: "Subscribers",
      href: "/account/chef/subscribers",
      icon: Users,
    },
    {
      label: "Promo Codes",
      href: "/account/chef/promo-codes",
      icon: Tag,
    },
    {
      label: "User account",
      href: "/account/chef/profile",
      icon: User,
    },
  ];

  const communityItems = [
    {
      label: "Reviews",
      href: "/account/chef/reviews",
      icon: MessageSquare,
    },
    {
      label: "User Recipes",
      href: "/account/chef/recipes",
      icon: BookOpen,
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
        className="bg-admin-green hover:bg-admin-green-hover fixed top-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors md:hidden"
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
        className={`fixed z-40 flex h-full w-64 transform flex-col bg-[#F9FAFB] shadow-sm transition-transform duration-300 ease-in-out md:relative md:h-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* User Profile Section */}
        <div className="border-b border-[#E5E7EB] px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-pink-400">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#1F2937]">
                Hello Chef
              </h2>
              <p className="text-admin-dark-gray text-sm">
                Your plan: <span className="text-admin-green">Free</span>
              </p>
            </div>
          </div>
        </div>

        {/* Create New Meal Button */}
        <div className="px-4 py-4">
          <Link
            href="/account/chef/meals/add"
            className="bg-admin-green hover:bg-admin-green-hover flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create new meal
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
          <div className="mb-4">
            <h3 className="mb-2 px-3 text-xs font-medium tracking-wider text-[#9CA3AF] uppercase">
              Menu
            </h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? "text-admin-green bg-admin-light-gray font-medium"
                      : "hover:text-admin-green hover:bg-admin-light-gray text-admin-dark-gray"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mb-4">
            <h3 className="mb-2 px-3 text-xs font-medium tracking-wider text-[#9CA3AF] uppercase">
              Community
            </h3>
            {communityItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? "text-admin-green bg-admin-light-gray font-medium"
                      : "hover:text-admin-green hover:bg-admin-light-gray text-admin-dark-gray"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-[#E5E7EB] px-4 py-4">
          <button className="hover:bg-admin-light-gray text-admin-dark-gray flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:text-[#EF4444]">
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
