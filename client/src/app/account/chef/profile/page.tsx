"use client";

import NotFound from "@/components/notFound";
import Error from "@/components/error";
import Loading from "@/components/loading";
import EditChefForm from "@/features/chef/components/edit-chef-form";
import { EditChefSchema } from "@/schema";
import { useGetChefByUserIdQuery } from "@/state/api";
import { useAuth } from "@/lib/auth";

export default function ChefProfilePage() {
  const { user: loggedUser } = useAuth();

  if (!loggedUser) {
    return <div>You must be logged in to access this page.</div>;
  }

  const {
    data: chefData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetChefByUserIdQuery({ userId: loggedUser.id });

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
    <div className="container mx-auto overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <EditChefForm chef={parsed.data} />
    </div>
  );
}
