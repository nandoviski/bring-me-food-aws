"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddMealForm from "@/features/meal/components/add-meal-form";

export default function AddMealPage() {
  const router = useRouter();

  return (
    <main className="flex-1 overflow-auto">
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 px-4 py-12 md:px-6 md:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Add New Meal
          </h1>
          <p className="mt-2 text-emerald-50">
            Create a new meal to add to your offerings. Fill out the details
            below.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm md:p-8">
        <AddMealForm
          onOpenChange={() => {}}
          onMealAdded={() => router.push("/account/chef/meals")}
        />
      </div>
    </main>
  );
}
