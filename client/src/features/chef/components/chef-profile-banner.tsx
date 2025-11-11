import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Chef } from "@/schema";
import { MapPin } from "lucide-react";
import Link from "next/link";
// import { FavoriteButton } from "./favorite-button";

type Props = {
  chef: Chef;
  isOwnProfile: boolean;
};

export function ChefProfileBanner({ chef, isOwnProfile }: Props) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="relative h-48 bg-linear-to-r from-orange-400 to-orange-600">
        <div className="absolute -bottom-16 left-8">
          <Avatar className="h-32 w-32 border-4 border-white">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${chef.name}`}
            />
            <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="px-8 pt-20 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{chef.name}</h1>
            <div className="mt-2 flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{chef.location}</span>
              </div>
              {/* <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>
                  {chef.rating} ({chef.reviews.length} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{chef.customersServed} customers served</span>
              </div> */}
            </div>
          </div>
          {isOwnProfile ? (
            <Link href="/account/chef/profile">
              <Button variant="outline">Edit Profile</Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              {/* <FavoriteButton
                chef={{
                  id: chef.id,
                  username: chef.username,
                  name: chef.name,
                  location: chef.location,
                  image: chef.image,
                }}
              /> */}
              <Button>Contact Chef</Button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">About</h2>
          <p className="text-gray-600">{chef.bio}</p>
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {(chef.specialties ?? "").split(/,|;/).map((specialty: string) => (
              <span
                key={specialty}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
