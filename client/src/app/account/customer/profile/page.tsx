import EditCustomerForm from "@/features/customer/components/edit-customer-form";
import { EditCustomerSchema } from "@/features/customer/schema/customer";
import { getCustomer } from "@/features/customer/server/db/customer";
import { fakeLoggedUser } from "@/hooks/mock-data";

export default async function CustomerProfilePage() {
  const logUser = fakeLoggedUser(); // TODO: Replace with actual user ID from logged-in user
  const user = await getCustomer(logUser.id);

  if (!user?.customer) {
    return <div>Customer not found</div>;
  }

  const validatedData = EditCustomerSchema.safeParse(user.customer);
  if (!validatedData.success) {
    return <div>Fail to validate customer</div>;
  }

  return (
    <div className="container mx-auto mt-4 overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <EditCustomerForm customer={validatedData.data} />
    </div>
  );
}
