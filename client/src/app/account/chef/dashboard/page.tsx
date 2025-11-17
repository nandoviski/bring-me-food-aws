"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import { ChefDashboard } from "@/features/chef/components/dashboard/dashboard";

export default function ChefDashboardPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <ChefDashboard />
    </div>
  );
}
