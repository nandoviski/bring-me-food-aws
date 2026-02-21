"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetRevenueTrendQuery } from "@/state/api";
import { useAuth } from "@/lib/auth";
import { TrendingUp } from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

export function RevenueChart() {
  const { user } = useAuth();
  const chefId = user?.chef?.id ?? "";
  const [days, setDays] = useState(14);

  const { data, isLoading } = useGetRevenueTrendQuery(
    { chefId, days },
    { skip: !chefId },
  );

  const trend = data?.trend ?? [];
  const hasAnyRevenue = trend.some((d) => d.revenue > 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Revenue</h3>
            <p className="text-xs text-slate-500">Non-cancelled orders</p>
          </div>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                days === opt.value
                  ? "bg-orange-500 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      )}

      {!isLoading && !hasAnyRevenue && (
        <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
          <TrendingUp className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm">No orders yet — revenue will appear here once customers start ordering.</p>
        </div>
      )}

      {!isLoading && hasAnyRevenue && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={trend}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              interval={days <= 14 ? 1 : Math.floor(days / 10)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              width={42}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number | undefined, name: string | undefined) => [
                `$${(value ?? 0).toFixed(2)}`,
                name === "revenue" ? "Total revenue" : "Paid (Stripe)",
              ]) as any}
              labelFormatter={(label) => label}
            />
            <Legend
              formatter={(value) => (
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  {value === "revenue" ? "Total orders" : "Paid (Stripe)"}
                </span>
              )}
            />
            <Bar dataKey="revenue" fill="#FED7AA" radius={[4, 4, 0, 0]} name="revenue" />
            <Bar dataKey="paidRevenue" fill="#F97316" radius={[4, 4, 0, 0]} name="paidRevenue" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {!isLoading && hasAnyRevenue && (
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-orange-200" />
            <span>Orders placed (not cancelled)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
            <span>Stripe confirmed payments</span>
          </div>
        </div>
      )}
    </div>
  );
}
