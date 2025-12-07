"use client";

import { useRouter } from "next/navigation";
import AddMealForm from "@/features/meal/components/add-meal-form";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export default function AddMealPage() {
  const router = useRouter();

  return (
    <MainPageWithHeader
      title="New Meal"
      description="Create a new meal to add to your offerings. Fill out the details below."
      backButton={true}
    >
      <AddMealForm
        onOpenChange={() => {}}
        onMealAdded={() => router.push("/account/chef/meals")}
      />
    </MainPageWithHeader>
  );
}
