"use client";

import { Suspense, useState, useMemo } from "react";
import { useGetAllChefsQuery } from "@/state/api";
import Link from "next/link";
import { MapPin, Search, UtensilsCrossed, Star } from "lucide-react";
import { StarRating } from "@/features/review/components/star-rating";
import { Input } from "@/components/ui/input";

// ─── Cuisine category filters ─────────────────────────────────────────────────
const CATEGORIES = [
  { label: "All", keywords: [] },
  { label: "🍜 Asian", keywords: ["asian", "chinese", "thai", "vietnamese", "korean", "japanese", "sushi", "ramen", "noodle", "dim sum"] },
  { label: "🍕 Italian", keywords: ["italian", "pasta", "pizza", "risotto", "mediterranean"] },
  { label: "🍛 Indian", keywords: ["indian", "curry", "biryani", "masala", "tandoor"] },
  { label: "🌮 Mexican", keywords: ["mexican", "taco", "burrito", "salsa", "guacamole"] },
  { label: "🥗 Vegan", keywords: ["vegan", "vegetarian", "plant-based", "plant based"] },
  { label: "🍱 Japanese", keywords: ["japanese", "sushi", "ramen", "bento", "tempura", "teriyaki"] },
  { label: "🥩 BBQ", keywords: ["bbq", "grill", "barbecue", "smoked", "roast"] },
  { label: "🥐 Bakery", keywords: ["bakery", "baking", "bread", "pastry", "cake", "dessert"] },
];

function matchesCategory(specialties: string | null, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  if (!specialties) return false;
  const lower = specialties.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

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
    profileImage: string | null;
    featured: boolean;
    available: boolean;
    _count: { meals: number; order: number };
    reviewStats?: { averageRating: number | null; reviewCount: number };
  };
}) {
  return (
    <Link
      href={`/chef/${chef.username}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        chef.available
          ? "border-gray-200 hover:border-orange-200"
          : "border-gray-200 opacity-60 grayscale hover:opacity-80"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500">
        {chef.profileImage ? (
          <img
            src={chef.profileImage}
            alt={chef.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl font-bold text-white">{chef.name[0]}</span>
        )}
        {chef.featured && chef.available && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
            <Star className="h-3 w-3 fill-white" />
            Featured
          </span>
        )}
        {!chef.available && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              On Break 🌿
            </span>
          </span>
        )}
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
                className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-0.5 text-xs text-orange-700"
              >
                {s.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Review stats */}
        {chef.reviewStats && chef.reviewStats.reviewCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <StarRating
              rating={Math.round(chef.reviewStats.averageRating ?? 0)}
              size="sm"
            />
            <span className="text-xs font-medium text-gray-700">
              {chef.reviewStats.averageRating?.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({chef.reviewStats.reviewCount})
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {chef._count.meals} meal{chef._count.meals !== 1 ? "s" : ""}
          </span>
          <span>
            {chef._count.order} order{chef._count.order !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ChefDirectory() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0); // index into CATEGORIES

  const { data, isLoading } = useGetAllChefsQuery(
    { search: debouncedSearch || undefined },
    { pollingInterval: 0 },
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    const timeout = setTimeout(() => setDebouncedSearch(e.target.value), 400);
    return () => clearTimeout(timeout);
  }

  const allChefs = data?.chefs ?? [];

  // Client-side category filter (backend already handles search)
  const chefs = useMemo(() => {
    const cat = CATEGORIES[activeCategory];
    if (!cat || cat.keywords.length === 0) return allChefs;
    return allChefs.filter((c) => matchesCategory(c.specialties, cat.keywords));
  }, [allChefs, activeCategory]);

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

      {/* Category pills */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-3">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(i)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                  activeCategory === i
                    ? "bg-orange-500 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
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
              {debouncedSearch || activeCategory !== 0
                ? `No chefs found${debouncedSearch ? ` for "${debouncedSearch}"` : ""}${activeCategory !== 0 ? ` in ${CATEGORIES[activeCategory].label}` : ""}`
                : "No chefs yet"}
            </h2>
            <p className="mt-2 text-gray-500">
              {debouncedSearch || activeCategory !== 0
                ? "Try a different search or category."
                : "Be the first! Sign up as a chef and start selling today."}
            </p>
            {!debouncedSearch && activeCategory === 0 && (
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
              {activeCategory !== 0 && ` · ${CATEGORIES[activeCategory].label}`}
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
