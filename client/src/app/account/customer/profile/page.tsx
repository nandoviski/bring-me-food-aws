"use client";

import NotFound from "@/components/notFound";
import EditCustomerForm from "@/features/customer/components/edit-customer-form";
import { EditCustomerSchema } from "@/features/customer/schema/customer";
import { fakeLoggedUser } from "@/hooks/mock-data";
import { useGetCustomerQuery } from "@/state/api";

export default function CustomerProfilePage() {
  const logUser = fakeLoggedUser(); // TODO: Replace with actual user ID from logged-in user
  const customer = useGetCustomerQuery({ userId: logUser.id });

  if (!customer) {
    return <NotFound message="Customer not found" />;
  }

  const validatedData = EditCustomerSchema.safeParse(customer);
  if (!validatedData.success) {
    return <div>Fail to validate customer</div>;
  }

  return (
    <div className="container mx-auto mt-4 overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <EditCustomerForm customer={validatedData.data} />
    </div>
  );
}
