"use client";

import CheckoutForm from "@/features/checkout/components/checkout-form";
import Loading from "@/components/loading";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function CheckoutPage() {
  const { user, isLoading } = useAuthGuard({ requireCustomer: true });

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <div>You must be logged in as a customer to checkout.</div>;
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
