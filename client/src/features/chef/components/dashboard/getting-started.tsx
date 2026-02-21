"use client";

import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetMealsByChefQuery, useGetMenusByChefQuery, useGetSubscribersQuery } from "@/state/api";

interface Step {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
}

export function GettingStarted() {
  const { user } = useAuth();
  const chefId = user?.chef?.id ?? "";

  const { data: mealsData } = useGetMealsByChefQuery({ chefId }, { skip: !chefId });
  // Fetch all menus (no filter) so we can detect distributedAt on past menus too
  const { data: menusData } = useGetMenusByChefQuery({ chefId, filter: "upcoming" }, { skip: !chefId });
  const { data: allMenusData } = useGetMenusByChefQuery({ chefId }, { skip: !chefId });
  const { data: subscriberData } = useGetSubscribersQuery({ chefId }, { skip: !chefId });

  if (!user?.chef) return null;

  const chef = user.chef;
  const hasBio = !!(chef as any).bio;
  const hasProfileImage = !!(chef as any).profileImage;
  const hasMeals = (mealsData?.length ?? 0) > 0;
  const hasMenu = (menusData?.length ?? 0) > 0;
  const hasSubscribers = (subscriberData?.count ?? 0) > 0;
  const hasDistributed = (allMenusData ?? []).some((m: any) => !!m.distributedAt);

  const steps: Step[] = [
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add a bio, profile photo, and your location",
      href: "/account/chef/profile",
      cta: "Edit profile",
      done: hasBio || hasProfileImage,
    },
    {
      id: "meals",
      title: "Add your first meal",
      description: "Add the meals you'll be selling this week",
      href: "/account/chef/meals/add",
      cta: "Add a meal",
      done: hasMeals,
    },
    {
      id: "menu",
      title: "Create a weekly menu",
      description: "Group your meals into a menu with a date range",
      href: "/account/chef/menus/add",
      cta: "Create menu",
      done: hasMenu,
    },
    {
      id: "share",
      title: "Share your profile link",
      description: "Send your link to potential customers so they can subscribe and order",
      href: "/account/chef/profile",
      cta: "Get my link",
      done: hasSubscribers,
    },
    {
      id: "distribute",
      title: "Send your first menu",
      description: "Hit 'Publish & Send' on your menu to notify all subscribers by email and SMS",
      href: "/account/chef/menus",
      cta: "Go to menus",
      done: hasDistributed,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (allDone) return null;

  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Get started</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {doneCount} of {steps.length} steps complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 rounded-full bg-orange-200 h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-orange-700 font-medium">
            {Math.round((doneCount / steps.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 rounded-lg p-3 ${step.done ? "opacity-60" : "bg-white"}`}
          >
            {step.done ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-orange-300 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                {step.title}
              </p>
              {!step.done && (
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
              )}
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="shrink-0 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
              >
                {step.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
