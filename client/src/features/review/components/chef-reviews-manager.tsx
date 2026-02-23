"use client";

import { useState } from "react";
import { useGetMyReviewsQuery } from "@/state/api";
import { StarRating } from "./star-rating";
import { ReviewCard } from "./review-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export function ChefReviewsManager() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyReviewsQuery({ page, limit: 20 });

  const stats = data?.stats;
  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Stats card */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Average Rating</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {stats.averageRating?.toFixed(1) ?? "—"}
              </span>
              <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.reviewCount}</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-sm text-gray-500">Your Stars</p>
            <div className="mt-2">
              <StarRating rating={Math.round(stats.averageRating ?? 0)} size="md" />
            </div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-gray-50 p-10 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <h3 className="font-semibold text-gray-700">No reviews yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Customers can leave reviews on your public profile after ordering.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} showHiddenBadge />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
