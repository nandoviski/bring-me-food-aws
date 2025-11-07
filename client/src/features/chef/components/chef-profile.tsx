"use client";

import Loading from "@/components/loading";
import {
  useGetChefByUsernameQuery,
  useLazyGetChefsWeeklyMenuQuery,
} from "@/state/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ChefProfileBanner } from "@/features/chef/components/chef-profile-banner";
import { WeeklyMenu } from "@/features/chef/components/weekly-menu";
import { useEffect } from "react";
import Error from "@/components/error";

export default function ChefProfilePage({ username }: { username: string }) {
  const isOwnProfile = false;

  const { data: chef, isLoading: isLoadingChef } = useGetChefByUsernameQuery({
    username,
  });

  const [
    trigger,
    { data: currentMenu, isLoading: isLoadingMenu, isError: isErrorMenu },
  ] = useLazyGetChefsWeeklyMenuQuery();

  useEffect(() => {
    if (chef?.id) {
      void trigger({ chefId: chef.id });
    }
  }, [chef, trigger]);

  if (isLoadingChef) {
    return <Loading message="Loading chef" />;
  }

  if (!chef) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Chef not found</p>
      </div>
    );
  }

  return (
    <>
      <ChefProfileBanner chef={chef} isOwnProfile={isOwnProfile} />

      <div className="mt-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="menu">Weekly Menu</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="menu">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <h2 className="text-xl font-semibold">
                    {currentMenu?.name ?? "Weekly Menu"}
                  </h2>
                  {currentMenu && (
                    <p className="text-sm text-gray-500">
                      {format(new Date(currentMenu.startDate), "MMM d")} -{" "}
                      {format(new Date(currentMenu.endDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <Link href="/dashboard/menus">
                  <Button variant="outline">Edit Menu</Button>
                </Link>
              )}
            </div>
            {isLoadingMenu ? (
              <Loading message="Loading menu" />
            ) : isErrorMenu ? (
              <Error message="Error retrieving menu" />
            ) : currentMenu ? (
              <WeeklyMenu meals={currentMenu.meals} />
            ) : (
              <div className="rounded-lg bg-gray-50 py-12 text-center">
                <p className="text-gray-500">
                  No active menu available at this time.
                </p>
                {isOwnProfile && (
                  <Link href="/dashboard/menus" className="mt-4 inline-block">
                    <Button>Create Menu</Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
          {/* <TabsContent value="reviews">
          <div className="rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Customer Reviews</h3>
            {chef.reviews.length > 0 ? (
              chef.reviews.map((review: any) => (
                <div key={review.id} className="border-b py-4 last:border-0">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{review.customerName}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No reviews yet.</p>
            )}
          </div>
        </TabsContent> */}
        </Tabs>
      </div>
    </>
  );
}
