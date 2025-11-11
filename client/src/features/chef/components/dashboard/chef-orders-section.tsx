"use client";

import { useAuth } from "@/lib/auth";
import { useGetOrdersByChefIdQuery } from "@/state/api";
import Loading from "@/components/loading";
import Error from "@/components/error";
import { OrdersList } from "./orders-list";

export function ChefOrdersSection() {
  const { user: loggedUser } = useAuth();
  const chefId = loggedUser?.chef?.id || "";

  const {
    data: orders,
    error,
    isLoading,
    isFetching,
  } = useGetOrdersByChefIdQuery({ chefId }, { skip: !chefId });

  if (!chefId) {
    return (
      <Error message="Chef information not available" fetchingError={null} />
    );
  }

  if (isLoading || isFetching) {
    return <Loading message="Loading orders..." />;
  }

  if (error) {
    return <Error message="Error loading orders" fetchingError={error} />;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">No orders found</p>
      </div>
    );
  }

  return <OrdersList orders={orders} />;
}
