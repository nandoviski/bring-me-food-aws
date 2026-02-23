"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number; // current value (1–5)
  max?: number;
  interactive?: boolean; // if true, renders clickable stars
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StarRating({
  rating,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
  className,
}: Props) {
  const starClass = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = value <= rating;

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(value)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${value} star${value !== 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  starClass,
                  "transition-colors",
                  filled
                    ? "fill-orange-400 text-orange-400"
                    : "fill-gray-100 text-gray-300",
                )}
              />
            </button>
          );
        }

        return (
          <Star
            key={i}
            className={cn(
              starClass,
              filled
                ? "fill-orange-400 text-orange-400"
                : "fill-gray-100 text-gray-300",
            )}
          />
        );
      })}
    </div>
  );
}
