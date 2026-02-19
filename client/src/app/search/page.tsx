"use client";

import { Suspense, useState } from "react";
import { useGetAllChefsQuery } from "@/state/api";
import Link from "next/link";
import { MapPin, Search, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";

function ChefCard({
  chef,
}: {
  chef: {
    id: string;
    username: string;
    name: string;
    location: string;
    bio: string | null;
    specialties: string | null;
    _count: { meals: number; order: number };
  };
}) {
  return (
    <Link
      href={`/chef/${chef.username}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-orange-200"
    >
      {/* Avatar placeholder */}
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500">
        <span className="text-5xl font-bold text-white">{chef.name[0]}</span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">
          {chef.name}
        </h3>

        {chef.location && (
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>{chef.location}</span>
          </div>
        )}

        {chef.bio && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{chef.bio}</p>
        )}

        {chef.specialties && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chef.specialties.split(/,|;/).slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-700 border border-orange-100"
              >
                {s.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {chef._count.meals} meal{chef._count.meals !== 1 ? "s" : ""}
          </span>
          <span>{chef._count.order} order{chef._count.order !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </Link>
  );
}

function ChefDirectory() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading } = useGetAllChefsQuery(
    { search: debouncedSearch || undefined },
    { pollingInterval: 0 }
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    // Simple debounce
    const timeout = setTimeout(() => setDebouncedSearch(e.target.value), 400);
    return () => clearTimeout(timeout);
  }

  const chefs = data?.chefs ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a2e25] to-[#2d4a3b] py-16 text-center text-white">
        <h1 className="mb-3 text-4xl font-bold">Find a Chef</h1>
        <p className="mb-8 text-gray-300">
          Order home-cooked meals from local chefs in your area.
        </p>
        <div className="mx-auto max-w-md px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, location, or cuisine…"
              value={search}
              onChange={handleSearch}
              className="bg-white pl-10 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Chef grid */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : chefs.length === 0 ? (
          <div className="py-24 text-center">
            <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900">
              {debouncedSearch ? `No chefs found for "${debouncedSearch}"` : "No chefs yet"}
            </h2>
            <p className="mt-2 text-gray-500">
              {debouncedSearch
                ? "Try a different search term."
                : "Be the first! Sign up as a chef and start selling today."}
            </p>
            {!debouncedSearch && (
              <Link
                href="/account/signin?type=chef"
                className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white hover:bg-orange-600"
              >
                Become a Chef →
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              {chefs.length} chef{chefs.length !== 1 ? "s" : ""} available
              {debouncedSearch && ` for "${debouncedSearch}"`}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {chefs.map((chef) => (
                <ChefCard key={chef.id} chef={chef} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <ChefDirectory />
    </Suspense>
  );
}
