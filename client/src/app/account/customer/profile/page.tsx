"use client";

import Loading from "@/components/loading";
import Error from "@/components/error";
import EditCustomerForm from "@/features/customer/components/edit-customer-form";
import { EditCustomerSchema } from "@/features/customer/schema/customer";
import { useAuth } from "@/lib/auth";
import { useGetCustomerQuery } from "@/state/api";
import NotFound from "@/components/notFound";

export default function CustomerProfilePage() {
  const { user: loggedUser } = useAuth();

  if (!loggedUser) {
    return <div>You must be logged in to access this page.</div>;
  }

  const {
    data: customer,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetCustomerQuery({ userId: loggedUser.id });

  if (isLoading || isFetching) {
    return <Loading message="Loading customer profile..." />;
  }

  if (isError) {
    return (
      <Error
        message="Error retrieving customer profile"
        fetchingError={error}
      />
    );
  }

  if (!customer) {
    return <NotFound message="Customer not found" />;
  }

  const validatedData = EditCustomerSchema.safeParse(customer);
  if (!validatedData.success) {
    return <Error message="Fail to validate customer" />;
  }

  return (
    <div className="container mx-auto mt-4 overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <EditCustomerForm customer={validatedData.data} />
    </div>
  );
}
