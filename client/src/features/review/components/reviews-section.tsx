"use client";

import { useState } from "react";
import { useGetChefReviewsQuery } from "@/state/api";
import { StarRating } from "./star-rating";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquarePlus, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  chefId: string;
  chefName: string;
  isLoggedIn?: boolean;
  customerName?: string;
};

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-gray-500">{star}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-gray-400">{count}</span>
    </div>
  );
}

export function ReviewsSection({ chefId, chefName, isLoggedIn, customerName }: Props) {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useGetChefReviewsQuery({ chefId, page, limit: 5 });

  const stats = data?.stats;
  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Write a review
        </Button>
      </div>

      {/* Aggregate stats */}
      {stats && stats.reviewCount > 0 ? (
        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Big number */}
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <span className="text-5xl font-bold text-gray-900">
                {stats.averageRating?.toFixed(1) ?? "—"}
              </span>
              <StarRating rating={Math.round(stats.averageRating ?? 0)} size="sm" />
              <span className="text-xs text-gray-400">
                {stats.reviewCount} review{stats.reviewCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Distribution bars */}
            {stats.distribution && (
              <div className="flex-1 w-full space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const d = stats.distribution!.find((d) => d.star === star);
                  return (
                    <RatingBar
                      key={star}
                      star={star}
                      count={d?.count ?? 0}
                      total={stats.reviewCount}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : !isLoading ? (
        <div className="mb-6 rounded-xl border border-dashed bg-gray-50 p-6 text-center text-sm text-gray-500">
          No reviews yet. Be the first to leave one!
        </div>
      ) : null}

      {/* Review cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
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

      {/* Review form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review {chefName}</DialogTitle>
          </DialogHeader>
          <ReviewForm
            chefId={chefId}
            chefName={chefName}
            isLoggedIn={isLoggedIn}
            customerName={customerName}
            onClose={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
