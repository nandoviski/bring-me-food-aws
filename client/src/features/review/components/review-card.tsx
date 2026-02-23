import type { Review } from "@/schema";
import { StarRating } from "./star-rating";
import { formatDistanceToNow } from "date-fns";

type Props = {
  review: Review;
  showHiddenBadge?: boolean;
};

export function ReviewCard({ review, showHiddenBadge }: Props) {
  const date = (() => {
    try {
      return formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });
    } catch {
      return "recently";
    }
  })();

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${review.hidden ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Avatar placeholder */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{review.authorName}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} size="sm" />
          {showHiddenBadge && review.hidden && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Hidden
            </span>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-gray-700">{review.comment}</p>
      )}
    </div>
  );
}
