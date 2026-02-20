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

export function ChefOrdersSection() {
  const { user: loggedUser } = useAuth();
  const chefId = loggedUser?.chef?.id || "";
  const [exporting, setExporting] = useState(false);

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

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {orders.length} order{orders.length === 1 ? "" : "s"} total
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
      <OrdersTable orders={orders} />
    </div>
  );
}
