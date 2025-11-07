"use client";

import { useAuth } from "@/lib/auth";
import { useGetCustomerOrdersQuery } from "@/state/api";
import OrdersList from "@/features/customer/components/orders-list";

export default function CustomerOrdersPage() {
  const { user: loggedUser } = useAuth();

  if (!loggedUser) {
    return <div>You must be logged in to access this page.</div>;
  }

  const {
    data: orders,
    error,
    isLoading,
    isFetching,
  } = useGetCustomerOrdersQuery(
    { userId: loggedUser.id },
    { skip: !loggedUser },
  );

  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Your Orders</h1>

        {isLoading || isFetching ? (
          <p className="mt-4">Loading orders...</p>
        ) : error ? (
          <p className="mt-4 text-red-600">Error loading orders</p>
        ) : orders && orders.length === 0 ? (
          <p className="mt-4">You have not placed any orders yet.</p>
        ) : (
          <div className="mt-6">
            <OrdersList orders={orders ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
