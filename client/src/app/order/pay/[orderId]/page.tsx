"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useCreateCheckoutSessionMutation } from "@/state/api";

export default function OrderPayPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handlePay() {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const session = await createCheckoutSession({ orderId }).unwrap();
      window.location.href = session.url;
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(
        err?.data?.message || "Unable to start payment. Please contact the chef directly."
      );
    }
  }

  // Auto-trigger on mount
  useEffect(() => {
    handlePay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === "loading" || status === "idle" ? (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Redirecting to payment…</h1>
            <p className="text-sm text-gray-500 mt-2">
              You&apos;ll be taken to our secure Stripe payment page in a moment.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-400" />
              </div>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Payment unavailable</h1>
            <p className="text-sm text-gray-500 mt-2 mb-6">{errorMsg}</p>
            <button
              onClick={handlePay}
              className="w-full rounded-lg bg-orange-500 text-white px-4 py-3 text-sm font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Try again
            </button>
            <p className="text-xs text-gray-400 mt-4">Order ID: {orderId}</p>
          </>
        )}
      </div>
    </div>
  );
}
