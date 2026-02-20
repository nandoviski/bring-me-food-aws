"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(10);

  // Countdown to redirect to home
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment successful! 🎉
        </h1>
        <p className="text-gray-500 mb-6">
          Your order has been placed and your payment is confirmed. The chef will
          get to work and reach out to arrange delivery or pickup.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Order ID
              </span>
            </div>
            <p className="text-sm font-mono text-gray-800 break-all">{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          {orderId && (
            <Link
              href={`/account/customer/orders/${orderId}`}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-orange-500 text-white px-4 py-3 text-sm font-medium hover:bg-orange-600 transition"
            >
              View order details
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center w-full rounded-lg border border-gray-200 text-gray-700 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Redirecting to home in {countdown}s…
        </p>
      </div>
    </div>
  );
}
