"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChefOrdersSection } from "./chef-orders-section";

type OrderListProps = Record<string, never>;

export default function OrderList({}: OrderListProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing orders from the last 7 days
        </p>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Clock className="h-4 w-4" />
          <span>Last 7 days</span>
        </Button>
      </div>

      {/* Content Section */}
      <ChefOrdersSection />
    </div>
  );
}
