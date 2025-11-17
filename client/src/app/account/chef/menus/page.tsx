"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import { MenusList } from "@/features/menu/components/menus-list";

export default function ChefMenusPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto overflow-hidden rounded-lg bg-white px-4 shadow-sm">
      <MenusList />
    </div>
  );
}
