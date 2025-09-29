"use client";

import NotFound from "@/components/notFound";
import Error from "@/components/error";
import EditChefForm from "@/features/chef/components/edit-chef-form";
import { EditChefSchema } from "@/features/chef/schema/chef";
import { fakeLoggedUser } from "@/hooks/mock-data";
import { useGetChefByUserIdQuery } from "@/state/api";

export default function ChefProfilePage() {
  const logUser = fakeLoggedUser(); // TODO: Replace with actual user ID from logged-in user
  const chef = useGetChefByUserIdQuery({ userId: logUser.id });

  if (!chef) {
    return <NotFound message="Chef not found" />;
  }

  const validatedData = EditChefSchema.safeParse(chef);
  if (!validatedData.success) {
    return <Error message="Fail to validate chef" />;
  }

  return (
    <div className="container mx-auto mt-4 overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <EditChefForm chef={validatedData.data} />
    </div>
  );
}
