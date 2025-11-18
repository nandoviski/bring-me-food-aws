"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import OrderList from "@/features/order/components/orders-list";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export default function ChefOrdersPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MainPageWithHeader
      title="Orders"
      description="Manage your customer orders"
    >
      <OrderList />
    </MainPageWithHeader>
  );
}
