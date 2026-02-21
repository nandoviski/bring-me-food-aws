"use client";

import NotFound from "@/components/notFound";
import Error from "@/components/error";
import Loading from "@/components/loading";
import EditChefForm from "@/features/chef/components/edit-chef-form";
import DeliveryZonesManager from "@/features/chef/components/delivery-zones-manager";
import { EditChefSchema } from "@/schema";
import { useGetChefByUserIdQuery } from "@/state/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export default function ChefProfilePage() {
  const { user: loggedUser, isLoading: authLoading } = useAuthGuard({
    requireChef: true,
  });

  if (authLoading) {
    return <Loading message="Loading..." />;
  }

  if (!loggedUser) {
    return <div>You must be logged in as a chef to access this page.</div>;
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
    <MainPageWithHeader
      title="Edit Chef Profile"
      description="Update your chef details"
    >
      <EditChefForm chef={parsed.data} />

      {/* Delivery Zones */}
      <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Delivery Zones</h2>
          <p className="mt-1 text-sm text-slate-500">
            Control where you deliver. Orders from outside your zones are still accepted — you'll see a flag and can decide to confirm or cancel.
          </p>
        </div>
        <DeliveryZonesManager chefId={chefData.id} />
      </div>
    </MainPageWithHeader>
  );
}
