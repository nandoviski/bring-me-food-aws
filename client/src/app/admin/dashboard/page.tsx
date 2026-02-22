"use client";

import { useGetAdminStatsQuery } from "@/state/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ChefHat,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Bell,
  CalendarDays,
  Mail,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
