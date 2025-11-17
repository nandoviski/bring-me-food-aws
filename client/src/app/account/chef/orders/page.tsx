"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import OrderList from "@/features/order/components/orders-list";

export default function ChefOrdersPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <OrderList />
    </div>
  );
}
