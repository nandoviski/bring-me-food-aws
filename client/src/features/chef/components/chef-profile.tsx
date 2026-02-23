"use client";

import Loading from "@/components/loading";
import {
  useGetChefByUsernameQuery,
  useLazyGetChefsWeeklyMenuQuery,
} from "@/state/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, ShoppingBag, Instagram, Facebook } from "lucide-react";
import { format } from "date-fns";
import { WeeklyMenu } from "@/features/chef/components/weekly-menu";
import { SubscribeWidget } from "@/features/chef/components/subscribe-widget";
import { ReviewsSection } from "@/features/review/components/reviews-section";
import { StarRating } from "@/features/review/components/star-rating";
import { useEffect } from "react";
import Error from "@/components/error";
import { useAuth } from "@/lib/auth";
import { useGetChefReviewsQuery } from "@/state/api";

export default function ChefProfile({ username }: { username: string }) {
  const isOwnProfile = false;
  const { user } = useAuth();

  const { data: chef, isLoading: isLoadingChef } = useGetChefByUsernameQuery({
    username,
  });

  const [
    trigger,
    { data: currentMenu, isLoading: isLoadingMenu, isError: isErrorMenu },
  ] = useLazyGetChefsWeeklyMenuQuery();

  // Fetch review stats for hero display
  const { data: reviewData } = useGetChefReviewsQuery(
    { chefId: chef?.id ?? "", limit: 1 },
    { skip: !chef?.id },
  );
  const reviewStats = reviewData?.stats;

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
          {/* Profile image */}
          <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full border-4 border-white/20">
            {chef.profileImage ? (
              <img
                src={chef.profileImage}
                alt={chef.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500 text-3xl font-bold text-white">
                {chef.name[0]}
              </div>
            )}
          </div>
          <h1 className="mb-4 font-serif text-5xl font-medium tracking-tight md:text-6xl">
            {chef.name}
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-lg text-gray-300 leading-relaxed">
            {chef.bio}
          </p>

          {/* Review aggregate in hero */}
          {reviewStats && reviewStats.reviewCount > 0 && (
            <div className="mb-6 flex items-center justify-center gap-2">
              <StarRating rating={Math.round(reviewStats.averageRating ?? 0)} size="sm" />
              <span className="text-sm font-semibold text-white">
                {reviewStats.averageRating?.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">
                ({reviewStats.reviewCount} review{reviewStats.reviewCount !== 1 ? "s" : ""})
              </span>
            </div>
          )}
          
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

          {/* Social links */}
          {(chef.instagramUrl || chef.facebookUrl) && (
            <div className="mt-6 flex justify-center gap-4">
              {chef.instagramUrl && (
                <a
                  href={chef.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                </a>
              )}
              {chef.facebookUrl && (
                <a
                  href={chef.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  Facebook
                </a>
              )}
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

      {/* On Break Banner */}
      {chef.available === false && (
        <div className="border-b border-yellow-200 bg-yellow-50 py-4 text-center">
          <p className="text-sm font-medium text-yellow-800">
            🌿 {chef.name} is currently on a break and not taking new orders.
            Check back soon!
          </p>
        </div>
      )}

      {/* Menu Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
           <span className="mb-2 block text-sm font-bold tracking-widest text-orange-600 uppercase">Weekly Menu</span>
           <h2 className="font-serif text-4xl text-[#1a2e25]">
              {currentMenu?.name ?? "Curated for You"}
           </h2>
           {currentMenu && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-500">
                 <div className="flex items-center gap-2">
                   <Calendar className="h-4 w-4" />
                   <p>
                      {format(new Date(currentMenu.startDate), "MMM d")} –{" "}
                      {format(new Date(currentMenu.endDate), "MMM d, yyyy")}
                   </p>
                 </div>
                 {(currentMenu as any).orderTo && (
                   <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                     <Clock className="h-3.5 w-3.5" />
                     <span className="text-sm font-medium">
                       Order by {format(new Date((currentMenu as any).orderTo), "EEE d MMM")}
                     </span>
                   </div>
                 )}
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
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-orange-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              No menu available this week
            </h3>
            <p className="mx-auto max-w-sm text-sm text-slate-600">
              Subscribe below to be the first to know when {chef.name} publishes their next menu — you&apos;ll get it by email and SMS.
            </p>
          </div>
        )}

        {/* Subscribe widget */}
        {chef && (
          <div className="mx-auto mt-16 max-w-md">
            <SubscribeWidget chefId={chef.id} chefName={chef.name} />
          </div>
        )}

        {/* Reviews section */}
        {chef && (
          <div className="mx-auto mt-8 max-w-2xl">
            <ReviewsSection
              chefId={chef.id}
              chefName={chef.name}
              isLoggedIn={!!user}
              customerName={
                user?.customer
                  ? user.customer.firstName
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
