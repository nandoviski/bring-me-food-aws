"use client";

import Loading from "@/components/loading";
import {
  useGetChefByUsernameQuery,
  useLazyGetChefsWeeklyMenuQuery,
} from "@/state/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { WeeklyMenu } from "@/features/chef/components/weekly-menu";
import { SubscribeWidget } from "@/features/chef/components/subscribe-widget";
import { useEffect } from "react";
import Error from "@/components/error";

export default function ChefProfile({ username }: { username: string }) {
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
    <div className="h-full">
      {/* Hero Section */}
      <div className="bg-primary px-4 py-20 text-center text-white">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-4 font-serif text-5xl font-medium tracking-tight md:text-6xl">
            {chef.name}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 leading-relaxed">
            {chef.bio}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm tracking-wide uppercase text-gray-400">
             <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-gray-600"></span>
                <span>{chef.location}</span>
                <span className="h-px w-8 bg-gray-600"></span>
             </div>
          </div>

          {/* Specialties as subtle tags */}
          {chef.specialties && (
             <div className="mt-8 flex flex-wrap justify-center gap-3">
                {chef.specialties.split(/,|;/).map((specialty) => (
                   <span key={specialty} className="rounded-full border border-white/20 px-4 py-1 text-xs tracking-wider text-gray-300 uppercase transition-colors hover:bg-white/10">
                      {specialty.trim()}
                   </span>
                ))}
             </div>
          )}

          {isOwnProfile && (
             <div className="mt-8">
                <Link href="/account/chef/profile">
                   <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                      Edit Profile
                   </Button>
                </Link>
             </div>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
           <span className="mb-2 block text-sm font-bold tracking-widest text-orange-600 uppercase">Weekly Menu</span>
           <h2 className="font-serif text-4xl text-[#1a2e25]">
              {currentMenu?.name ?? "Curated for You"}
           </h2>
           {currentMenu && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                 <Calendar className="h-4 w-4" />
                 <p>
                    {format(new Date(currentMenu.startDate), "MMM d")} -{" "}
                    {format(new Date(currentMenu.endDate), "MMM d, yyyy")}
                 </p>
              </div>
           )}
        </div>

        {isLoadingMenu ? (
          <Loading message="Loading menu" />
        ) : isErrorMenu ? (
          <Error message="Error retrieving menu" />
        ) : currentMenu ? (
          <WeeklyMenu meals={currentMenu.meals} />
        ) : (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
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

        {/* Subscribe widget */}
        {chef && (
          <div className="mx-auto mt-16 max-w-md">
            <SubscribeWidget chefId={chef.id} chefName={chef.name} />
          </div>
        )}
      </div>
    </div>
  );
}
