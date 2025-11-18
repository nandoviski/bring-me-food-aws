"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import { MenusList } from "@/features/menu/components/menus-list";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export default function ChefMenusPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MainPageWithHeader title="Menus" description="Manage your menus">
      <MenusList />
    </MainPageWithHeader>
  );
}
