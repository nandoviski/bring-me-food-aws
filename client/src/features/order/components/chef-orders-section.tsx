"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetOrdersByChefIdQuery } from "@/state/api";
import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";
import { OrdersTable } from "./orders-table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

const STATUS_TABS: { key: StatusFilter; label: string; color?: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { key: "CONFIRMED", label: "Confirmed", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { key: "DELIVERED", label: "Delivered", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { key: "CANCELLED", label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200" },
];

export function ChefOrdersSection() {
  const { user: loggedUser } = useAuth();
  const chefId = loggedUser?.chef?.id || "";
  const [exporting, setExporting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");

  const {
    data: orders,
    error,
    isLoading,
    isFetching,
  } = useGetOrdersByChefIdQuery({ chefId }, { skip: !chefId });

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("bmf_access_token");
      const res = await fetch(`${API_BASE}/orders/chef/${chefId}/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `orders-${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (!chefId) {
    return (
      <ErrorComponent message="Chef information not available" fetchingError={null} />
    );
  }

  if (isLoading || isFetching) {
    return <Loading message="Loading orders..." />;
  }

  if (error) {
    return <ErrorComponent message="Error loading orders" fetchingError={error} />;
  }

  const allOrders = orders ?? [];

  // Count per status for badge numbers
  const counts: Record<StatusFilter, number> = {
    ALL: allOrders.length,
    PENDING: allOrders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: allOrders.filter((o) => o.status === "CONFIRMED").length,
    DELIVERED: allOrders.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: allOrders.filter((o) => o.status === "CANCELLED").length,
  };

  // Apply filter
  const filtered =
    activeFilter === "ALL" ? allOrders : allOrders.filter((o) => o.status === activeFilter);

  if (allOrders.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          const count = counts[key];
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-orange-300 bg-orange-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600"
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0 text-xs font-semibold ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length} order{filtered.length === 1 ? "" : "s"}
          {activeFilter !== "ALL" && <span className="ml-1 text-slate-400">({activeFilter.toLowerCase()})</span>}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          className="gap-2 text-slate-600"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-100 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No {activeFilter.toLowerCase()} orders</p>
        </div>
      ) : (
        <OrdersTable orders={filtered} />
      )}
    </div>
  );
}
