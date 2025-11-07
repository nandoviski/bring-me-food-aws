"use client";

import { OrderShape } from "@/features/checkout/schema/order";
import OrderCard from "./order-card";

export default function OrdersList({ orders }: { orders: OrderShape[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}
