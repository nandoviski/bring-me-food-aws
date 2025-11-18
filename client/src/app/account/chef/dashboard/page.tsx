"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import { ChefDashboard } from "@/features/chef/components/dashboard/dashboard";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export default function ChefDashboardPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MainPageWithHeader
      title="Dashboard"
      description="Overview of your chef account"
    >
      <ChefDashboard />
    </MainPageWithHeader>
  );
}
