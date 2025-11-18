"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddMenuForm from "@/features/menu/components/add-menu-form";
import { useGetMenusByChefQuery } from "@/state/api";
import { useAuth } from "@/lib/auth";
import { type EditMenuType } from "@/schema";

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params.menuId as string;
  const { user: loggedUser } = useAuth();

  const { data: menus } = useGetMenusByChefQuery(
    { chefId: loggedUser?.chef?.id || "" },
    { skip: !loggedUser?.chef?.id }
  );

  // Find the menu being edited
  const menu = menus?.find((m) => m.id === menuId);

  // Transform menu data for the form
  const initialData: EditMenuType | undefined = menu
    ? {
        name: menu.name,
        description: menu.description,
        startDate: new Date(menu.startDate),
        endDate: new Date(menu.endDate),
        orderFrom: menu.orderFrom ? new Date(menu.orderFrom) : undefined,
        orderTo: menu.orderTo ? new Date(menu.orderTo) : undefined,
        meals: menu.meals.map((m) => m.id).filter((id) => id !== undefined) as string[],
      }
    : undefined;

  if (!menu && menus) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 px-4 py-12 md:px-6 md:py-16">
          {/* Subtle background pattern */}
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
              Menu Not Found
            </h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      {/* Hero Section with Green Gradient and Pattern */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 px-4 py-12 md:px-6 md:py-16">
        {/* Subtle background pattern */}
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
            Edit Menu
          </h1>
          <p className="mt-2 text-emerald-50">
            Update your menu details and meal selections.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-slate-50 px-4 py-8 md:px-6 md:py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-lg bg-white p-6 shadow-sm md:p-8">
            {initialData ? (
              <AddMenuForm
                onOpenChange={() => {}}
                onMenuAdded={() => router.push("/account/chef/menus")}
                initialData={initialData}
                menuId={menuId}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading menu data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
