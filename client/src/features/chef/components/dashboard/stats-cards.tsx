"use client";

import { ArrowDown, ArrowUp, CreditCard, DollarSign, Package, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useGetChefStatsQuery } from "@/state/api";

export function StatsCards() {
  const { user } = useAuth();
  const chefId = user?.chef?.id ?? "";

  const { data: stats, isLoading } = useGetChefStatsQuery(
    { chefId },
    { skip: !chefId }
  );

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-20 animate-pulse rounded" />
              <div className="bg-muted h-3 w-32 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue This Week</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.revenueThisWeek.toFixed(2)}</div>
          <ChangeLabel change={stats.revenueChange} unit="%" suffix="from last week" />
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders This Week</CardTitle>
          <Package className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ordersThisWeek}</div>
          <ChangeLabel change={stats.ordersChange} unit="%" suffix="from last week" />
        </CardContent>
      </Card>

      {/* Pending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <p className="text-muted-foreground text-xs">
            {stats.pendingOrders === 0
              ? "All caught up 🎉"
              : `Need${stats.pendingOrders === 1 ? "s" : ""} confirmation`}
          </p>
        </CardContent>
      </Card>

      {/* Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers This Week</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueCustomersThisWeek}</div>
          <ChangeLabel change={stats.customersChange} unit="" suffix="from last week" isAbsolute />
        </CardContent>
      </Card>
    </div>
  );
}

function ChangeLabel({
  change,
  unit,
  suffix,
  isAbsolute = false,
}: {
  change: number | null;
  unit: string;
  suffix: string;
  isAbsolute?: boolean;
}) {
  if (change === null) {
    return <p className="text-muted-foreground text-xs">No data from last week</p>;
  }

  const positive = change >= 0;
  const formatted = isAbsolute
    ? `${positive ? "+" : ""}${Math.round(change)}`
    : `${positive ? "+" : ""}${change.toFixed(1)}${unit}`;

  return (
    <p className="text-muted-foreground text-xs">
      <span className={`inline-flex items-center ${positive ? "text-green-500" : "text-red-500"}`}>
        {positive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
        {formatted}
      </span>{" "}
      {suffix}
    </p>
  );
}
