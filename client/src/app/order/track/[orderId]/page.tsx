"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, Truck, XCircle, Package, CreditCard, ChefHat, Loader2 } from "lucide-react";
import Link from "next/link";

type OrderTracking = {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  guestName?: string;
  grandTotal: number;
  chef?: {
    name: string;
    username: string;
    profileImage?: string;
    phoneNumber?: string;
  };
  mealsOnOrders?: Array<{
    quantity: number;
    priceAtPurchase: number;
    meal: { id: string; name: string; description?: string };
  }>;
};

const ORDER_STEPS = [
  { key: "PENDING", label: "Order received", icon: Clock, description: "Your order has been placed" },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle, description: "The chef is preparing your order" },
  { key: "DELIVERED", label: "Delivered", icon: Truck, description: "Your food is on its way!" },
];

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = ORDER_STEPS.findIndex((s) => s.key === status);
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <div>
          <p className="font-medium text-red-800">Order cancelled</p>
          <p className="text-xs text-red-600 mt-0.5">This order was cancelled. Contact the chef if you have questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ORDER_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i <= currentIdx;
        const active = i === currentIdx;

        return (
          <div key={step.key} className="flex items-start gap-4">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
              done
                ? active
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-emerald-500 bg-emerald-500 text-white"
                : "border-gray-200 bg-white text-gray-300"
            }`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 pb-3">
              <p className={`font-medium text-sm ${done ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </p>
              {active && (
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              )}
            </div>
            {active && (
              <span className="mt-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                Current
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`${API_BASE}/orders/${orderId}/track`)
      .then((r) => {
        if (!r.ok) throw new Error("Order not found");
        return r.json();
      })
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-orange-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-800 mb-2">Order not found</h1>
          <p className="text-sm text-gray-500 mb-6">
            We couldn&apos;t find that order. Check your confirmation email for the correct order ID.
          </p>
          <Link href="/" className="text-sm text-orange-600 hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  const unpaid = order.paymentStatus === "PENDING" && order.status !== "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <ChefHat className="h-10 w-10 text-orange-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-sm text-gray-500 mt-1">
            Order #{order.id.slice(0, 8)} · {new Date(order.createdAt).toLocaleDateString("en-AU", { dateStyle: "medium" })}
          </p>
        </div>

        {/* Unpaid warning */}
        {unpaid && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Payment required</p>
              <p className="text-xs text-amber-700 mt-0.5 mb-3">Your order won&apos;t be confirmed until payment is complete.</p>
              <button
                onClick={() => router.push(`/order/pay/${order.id}`)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 transition"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Pay ${order.grandTotal.toFixed(2)} now
              </button>
            </div>
          </div>
        )}

        {/* Status timeline */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Order status</h2>
          <StatusTimeline status={order.status} />
        </div>

        {/* Order details */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Order details</h2>

          {order.chef && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
                {order.chef.profileImage ? (
                  <img src={order.chef.profileImage} alt={order.chef.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-orange-600 font-bold text-sm">{order.chef.name[0]}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{order.chef.name}</p>
                {order.chef.phoneNumber && (
                  <p className="text-xs text-gray-500">{order.chef.phoneNumber}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 mb-4">
            {(order.mealsOnOrders ?? []).map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.meal.name} × {item.quantity}</span>
                <span className="text-gray-500">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery fee</span>
                <span className="text-gray-500">${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-orange-600">${order.grandTotal.toFixed(2)}</span>
          </div>

          {order.deliveryAddress && (
            <p className="mt-3 text-xs text-gray-500">📍 {order.deliveryAddress}</p>
          )}
          {order.notes && (
            <p className="mt-1 text-xs text-gray-500">📝 {order.notes}</p>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to Bring Me Food</Link>
        </div>
      </div>
    </div>
  );
}
