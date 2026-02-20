"use client";

import type { Order } from "@/schema";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle, RefreshCw } from "lucide-react";

function formatCurrency(v: number) {
  return `$${v.toFixed(2)}`;
}

type Props = {
  order: Order;
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "Delivered", className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

const PAYMENT_CONFIG: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
  PENDING: {
    label: "Awaiting payment",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <CreditCard className="h-3 w-3" />,
  },
  PAID: {
    label: "Paid ✓",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <RefreshCw className="h-3 w-3" />,
  },
  FAILED: {
    label: "Payment failed",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function OrderCard({ order }: Props) {
  const total =
    (order.meals ?? []).reduce((s, m) => s + (m.price || 0), 0) ||
    order.total ||
    0;
  const router = useRouter();

  const statusConfig = STATUS_LABEL[order.status] ?? { label: order.status, className: "bg-slate-100 text-slate-600" };
  const paymentStatus = order.paymentStatus ?? "PENDING";
  const paymentConfig = PAYMENT_CONFIG[paymentStatus] ?? PAYMENT_CONFIG.PENDING;
  const showPayButton = paymentStatus === "PENDING" && order.status !== "CANCELLED";

  return (
    <article className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Order</div>
          <div className="font-mono text-sm text-slate-800">{order.id.slice(0, 8)}&hellip;</div>
        </div>

        <div className="text-right flex flex-col items-end gap-1.5">
          <div className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
          </div>
          <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}>
            {statusConfig.label}
          </div>
          <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${paymentConfig.className}`}>
            {paymentConfig.icon}
            {paymentConfig.label}
          </div>
        </div>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          {order.chef && (
            <>
              <div className="text-xs text-slate-500">Chef</div>
              <div className="mt-0.5 text-sm">
                {order.chef.name}{" "}
                {order.chef.username && (
                  <span className="text-slate-400">(@{order.chef.username})</span>
                )}
              </div>
            </>
          )}

          {(order.meals ?? []).length > 0 && (
            <>
              <div className="mt-3 text-xs text-slate-500">Items</div>
              <ul className="mt-1 space-y-0.5">
                {(order.meals ?? []).map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{m.name}</span>
                    <span className="text-slate-500 ml-4">{formatCurrency(m.price)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="flex flex-col items-end justify-between">
          {order.deliveryAddress && (
            <div className="text-right">
              <div className="text-xs text-slate-500">Delivery</div>
              <div className="mt-0.5 text-xs text-slate-600">{order.deliveryAddress}</div>
            </div>
          )}

          <div className="mt-4 w-full border-t border-slate-100 pt-4 text-right">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</div>

            <div className="mt-3 flex flex-col gap-2 items-end">
              {showPayButton && (
                <button
                  onClick={() => router.push(`/order/pay/${order.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 transition"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Pay Now
                </button>
              )}
              <button
                onClick={() => router.push(`/account/customer/orders/${order.id}`)}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                View details
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
