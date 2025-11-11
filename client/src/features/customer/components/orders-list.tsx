"use client";

import type { Order } from "@/schema";
import OrderCard from "./order-card";

type Props = {
  orders: Order[];
};

export default function OrdersList({ orders }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}
