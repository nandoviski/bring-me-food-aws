"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import MainPageWithHeader from "@/components/chef/main-page-with-header";
import { SubscribersList } from "@/features/subscriber/components/subscribers-list";

export default function ChefSubscribersPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MainPageWithHeader
      title="Subscribers"
      description="People who get your weekly menu by email or SMS"
    >
      <SubscribersList />
    </MainPageWithHeader>
  );
}
