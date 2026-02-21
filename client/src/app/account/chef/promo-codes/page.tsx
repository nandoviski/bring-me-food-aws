"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/loading";
import MainPageWithHeader from "@/components/chef/main-page-with-header";
import { PromoCodesManager } from "@/features/promo/components/promo-codes-manager";

export default function PromoCodesPage() {
  const { isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) return <Loading />;

  return (
    <MainPageWithHeader
      title="Promo Codes"
      description="Create discount codes to share with customers and run promotions"
    >
      <PromoCodesManager />
    </MainPageWithHeader>
  );
}
