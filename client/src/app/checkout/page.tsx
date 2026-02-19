"use client";

import { useState } from "react";
import CheckoutForm from "@/features/checkout/components/checkout-form";
import GuestCheckoutForm from "@/features/checkout/components/guest-checkout-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

type CheckoutMode = "choose" | "guest" | "account";

export default function CheckoutPage() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<CheckoutMode>("choose");

  if (isLoading) {
    return <Loading />;
  }

  // Logged-in customer goes straight to their form
  if (user && user.customer && mode !== "guest") {
    return <CheckoutForm customer={user.customer} userEmail={user.email} />;
  }

  // Guest mode selected
  if (mode === "guest") {
    return <GuestCheckoutForm />;
  }

  // Not logged in — show choice screen
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-lg px-4 pt-24 pb-16">
        <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">
          How would you like to check out?
        </h1>
        <p className="mb-10 text-center text-sm text-gray-500">
          Guest checkout is quick and free. Create an account to track your orders.
        </p>

        <div className="space-y-4">
          {/* Guest checkout */}
          <button
            onClick={() => setMode("guest")}
            className="flex w-full items-start gap-4 rounded-xl border-2 border-orange-200 bg-white p-6 text-left transition hover:border-orange-400 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Continue as guest</div>
              <div className="mt-0.5 text-sm text-gray-500">
                Just your name + phone. No sign-up required.
              </div>
            </div>
          </button>

          {/* Sign in / create account */}
          <Link
            href="/account/signin?redirect=/checkout"
            className="flex w-full items-start gap-4 rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition hover:border-gray-400 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Sign in or create an account</div>
              <div className="mt-0.5 text-sm text-gray-500">
                Track your orders and save your details for next time.
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
