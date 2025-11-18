"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import { MealsList } from "@/features/meal/components/meals-list";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export default function ChefMealsPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MainPageWithHeader title="Meals" description="Manage your meals">
      <MealsList />
    </MainPageWithHeader>
  );
}
