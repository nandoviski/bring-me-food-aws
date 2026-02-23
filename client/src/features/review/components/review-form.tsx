"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateReviewSchema, type CreateReviewType } from "@/schema";
import { useCreateReviewMutation } from "@/state/api";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

type Props = {
  chefId: string;
  chefName: string;
  orderId?: string;
  isLoggedIn?: boolean;
  customerName?: string;
  onClose?: () => void;
};

export function ReviewForm({
  chefId,
  chefName,
  orderId,
  isLoggedIn,
  customerName,
  onClose,
}: Props) {
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateReviewType>({
    resolver: zodResolver(CreateReviewSchema),
    defaultValues: {
      chefId,
      orderId,
      rating: 0,
      authorName: customerName || "",
    },
  });

  const onSubmit = async (data: CreateReviewType) => {
    if (!rating) {
      setRatingError("Please select a star rating");
      return;
    }
    setRatingError("");
    try {
      await createReview({ ...data, rating }).unwrap();
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to submit review. Please try again.";
      setRatingError(msg);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900">Thanks for your review!</h3>
        <p className="text-sm text-gray-500">Your review helps others discover great chefs.</p>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="mt-2">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">
          Your overall rating of <span className="font-semibold">{chefName}</span>
        </p>
        <StarRating
          rating={rating}
          interactive
          size="lg"
          onChange={(val) => {
            setRating(val);
            setValue("rating", val);
            setRatingError("");
          }}
        />
        {ratingError && (
          <p className="mt-1 text-xs text-red-500">{ratingError}</p>
        )}
      </div>

      {!isLoggedIn && (
        <div>
          <Label htmlFor="authorName">Your name</Label>
          <Input
            id="authorName"
            placeholder="e.g. Maria S."
            {...register("authorName")}
            className="mt-1"
          />
          {errors.authorName && (
            <p className="mt-1 text-xs text-red-500">{errors.authorName.message}</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="comment">Your review (optional)</Label>
        <Textarea
          id="comment"
          placeholder="What did you love? What could be better?"
          rows={4}
          maxLength={1000}
          {...register("comment")}
          className="mt-1 resize-none"
        />
        {errors.comment && (
          <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit review"
          )}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
