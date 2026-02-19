"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useGetPopularMealsQuery } from "@/state/api";
import { UtensilsCrossed } from "lucide-react";

export function PopularMealsCard() {
  const { user } = useAuth();
  const chefId = user?.chef?.id ?? "";

  const { data, isLoading } = useGetPopularMealsQuery({ chefId }, { skip: !chefId });
  const meals = data?.meals ?? [];

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Popular Meals</CardTitle>
        <CardDescription>Your top-selling meals of all time</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 rounded bg-slate-100" />
                  <div className="h-2 w-20 rounded bg-slate-100" />
                </div>
                <div className="h-3 w-12 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <UtensilsCrossed className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No orders yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Once customers order, your most popular meals appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal, i) => (
              <div key={meal.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-semibold text-orange-600">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {meal.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {meal.totalOrdered} ordered · ${meal.totalRevenue.toFixed(2)} revenue
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  ${meal.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href="/account/chef/meals"
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium shadow-xs transition-colors"
        >
          View All Meals
        </Link>
      </CardFooter>
    </Card>
  );
}
