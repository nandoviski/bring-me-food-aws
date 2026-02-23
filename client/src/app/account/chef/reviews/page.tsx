"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import MainPageWithHeader from "@/components/chef/main-page-with-header";
import { ChefReviewsManager } from "@/features/review/components/chef-reviews-manager";

export default function ChefReviewsPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MainPageWithHeader
      title="Reviews"
      description="See what customers say about your cooking"
    >
      <ChefReviewsManager />
    </MainPageWithHeader>
  );
}
