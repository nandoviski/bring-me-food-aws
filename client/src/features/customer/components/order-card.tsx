"use client";

import type { OrderShape } from "@/schema";
import { useRouter } from "next/navigation";

function formatCurrency(v: number) {
  return `$${v.toFixed(2)}`;
}

type Props = {
  order: OrderShape;
};

export default function OrderCard({ order }: Props) {
  const total =
    (order.meals ?? []).reduce((s, m) => s + (m.price || 0), 0) || order.total || 0;
  const router = useRouter();

  function viewMore() {
    router.push(`/account/customer/orders/${order.id}`);
  }

  return (
    <article className="w-full rounded border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">Order</div>
          <div className="font-medium wrap-break-word">{order.id}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleString()}
          </div>
          <div className="mt-2 inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium">
            {order.status}
          </div>
        </div>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="text-xs text-slate-500">Chef</div>
          <div className="mt-1 text-sm">
            {order.chef?.name ?? "-"}{" "}
            {order.chef?.username ? (
              <span className="text-slate-500">(@{order.chef.username})</span>
            ) : null}
          </div>

          <div className="mt-3 text-xs text-slate-500">Meals</div>
          <ul className="mt-2 list-inside list-disc text-sm">
            {(order.meals ?? []).map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span>{m.name}</span>
                <span className="ml-4 text-slate-700">
                  {formatCurrency(m.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="text-xs text-slate-500">Delivery</div>
          <div className="mt-1 text-right text-sm">
            {order.deliveryAddress ?? "-"}
          </div>

          <div className="mt-4 w-full border-t border-slate-100 pt-4 text-right">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-lg font-semibold">{formatCurrency(total)}</div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={viewMore}
                className="inline-flex items-center rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
              >
                View more
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
