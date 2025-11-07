"use client";

import CheckoutForm from "@/features/checkout/components/checkout-form";
import { useAuth } from "@/lib/auth";

export default function CheckoutPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Redirect to login</div>;
  }

  if (!user.customer) {
    return <div>Missing customer data</div>;
  }

  return (
    <>
      <CheckoutForm customer={user.customer} userEmail={user.email} />
    </>
  );
}
