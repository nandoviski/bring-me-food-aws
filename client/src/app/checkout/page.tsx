import CheckoutForm from "@/features/checkout/components/checkout-form";
import { fakeLoggedUser } from "@/hooks/mock-data";

export default async function CheckoutPage() {
  const user = fakeLoggedUser();
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
