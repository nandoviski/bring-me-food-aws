"use client";

import { useState } from "react";
import { useGetAdminStatsQuery, useGetAdminRevenueTrendQuery } from "@/state/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ChefHat,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Bell,
  CalendarDays,
  Mail,
  Star,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "orange",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  accent?: "orange" | "blue" | "green" | "purple";
}) {
  const colors = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
          </div>
          <div className={`rounded-lg p-2.5 ${colors[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function orderStatusBadge(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "outline",
    CONFIRMED: "secondary",
    DELIVERED: "default",
    CANCELLED: "destructive",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

function paymentBadge(status: string) {
  if (status === "PAID") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">PAID</Badge>;
  if (status === "PENDING") return <Badge variant="outline">PENDING</Badge>;
  if (status === "REFUNDED") return <Badge variant="secondary">REFUNDED</Badge>;
  return <Badge variant="destructive">{status}</Badge>;
}

function RevenueTrendChart() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useGetAdminRevenueTrendQuery({ days });

  const formatted = (data?.trend ?? []).map((d) => ({
    ...d,
    label: format(new Date(d.date + "T00:00:00"), "MMM d"),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Platform Revenue
          </CardTitle>
          <div className="flex gap-1">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? "default" : "outline"}
                className="h-7 px-2 text-xs"
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-gray-400 text-sm">
            Loading chart…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval={days <= 7 ? 0 : Math.floor(formatted.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={45}
              />
              <Tooltip
                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, "Revenue"]}
                contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useGetAdminStatsQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading platform data…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Failed to load stats. Make sure you're logged in as admin.
      </div>
    );
  }

  const { stats, recentChefs, recentOrders } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Live stats across all chefs and customers.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.chefs} chefs · ${stats.users.customers} customers`}
          icon={Users}
          accent="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.total}
          subtitle={`${stats.orders.pending} pending`}
          icon={ShoppingCart}
          accent="orange"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue.total)}
          subtitle={`${formatCurrency(stats.revenue.thisMonth)} this month`}
          icon={DollarSign}
          accent="green"
        />
        <StatCard
          title="Subscribers"
          value={stats.subscribers.total}
          subtitle="Active email subscribers"
          icon={Mail}
          accent="purple"
        />
        {(stats as any).reviews && (
          <StatCard
            title="Platform Reviews"
            value={(stats as any).reviews.total}
            subtitle={
              (stats as any).reviews.averageRating
                ? `⭐ ${(stats as any).reviews.averageRating.toFixed(1)} avg rating`
                : "No ratings yet"
            }
            icon={Star}
            accent="orange"
          />
        )}
      </div>

      {/* Weekly metrics */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Orders This Week"
          value={stats.orders.thisWeek}
          icon={TrendingUp}
          accent="orange"
        />
        <StatCard
          title="Revenue This Week"
          value={formatCurrency(stats.revenue.thisWeek)}
          icon={CalendarDays}
          accent="green"
        />
      </div>

      {/* Revenue trend chart */}
      <RevenueTrendChart />

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent chefs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ChefHat className="h-4 w-4 text-orange-500" />
              Recently Joined Chefs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentChefs.length === 0 ? (
              <p className="text-sm text-gray-400">No chefs yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentChefs.map((chef) => (
                  <li key={chef.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{chef.name}</p>
                      <p className="text-xs text-gray-400">
                        @{chef.username} · {chef.location}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(chef.createdAt), { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-orange-500" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.guestName ?? "Registered customer"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.chef.name} · {formatCurrency(order.total)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {orderStatusBadge(order.status)}
                      {paymentBadge(order.paymentStatus)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
