"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useGetCustomerOrdersQuery } from "@/state/api";
import OrderCard from "@/features/customer/components/order-card";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.orderId as string | undefined;

  const { user: loggedUser } = useAuth();

  if (!loggedUser) {
    return (
      <div className="p-6">You must be logged in to access this page.</div>
    );
  }

  const {
    data: orders,
    isLoading,
    isFetching,
    error,
  } = useGetCustomerOrdersQuery(
    { userId: loggedUser.id },
    { skip: !loggedUser },
  );

  if (isLoading || isFetching) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading order</div>;

  const order = orders?.find((o) => o.id === orderId);

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Order details</h1>
        <OrderCard order={order} />
      </div>
    </div>
  );
}
