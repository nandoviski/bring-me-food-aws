"use client";

import NotFound from "@/components/notFound";
import Error from "@/components/error";
import Loading from "@/components/loading";
import EditChefForm from "@/features/chef/components/edit-chef-form";
import { EditChefSchema } from "@/features/chef/schema/chef";
import { fakeLoggedUser } from "@/hooks/mock-data";
import { useGetChefByUserIdQuery } from "@/state/api";

export default function ChefProfilePage() {
  const logUser = fakeLoggedUser(); // TODO: Replace with actual user ID from logged-in user

  const {
    data: chefData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetChefByUserIdQuery({ userId: logUser.id });

  if (isLoading || isFetching) {
    return <Loading message="Loading chef profile..." />;
  }

  if (isError) {
    return (
      <Error message="Error retrieving chef profile" fetchingError={error} />
    );
  }

  if (!chefData) {
    return <NotFound message="Chef not found" />;
  }

  const parsed = EditChefSchema.safeParse(chefData);
  if (!parsed.success) {
    return <Error message="Chef data failed validation" />;
  }

  return (
    <div className="container mx-auto mt-4 overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <EditChefForm chef={parsed.data} />
    </div>
  );
}
