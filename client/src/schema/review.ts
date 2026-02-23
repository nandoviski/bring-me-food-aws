import { z } from "zod";

// ─── Database interface ───────────────────────────────────────────────────────

export interface Review {
  id: string;
  chefId: string;
  orderId?: string | null;
  customerId?: string | null;
  authorName: string;
  rating: number; // 1–5
  comment?: string | null;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ReviewStats {
  averageRating: number | null;
  reviewCount: number;
  distribution?: { star: number; count: number }[];
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: ReviewStats;
}

// ─── Form schemas ─────────────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  chefId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1, "Please select a rating").max(5),
  comment: z
    .string()
    .max(1000, "Comment must be 1000 characters or less")
    .optional(),
  authorName: z
    .string()
    .min(1, "Name is required")
    .max(150)
    .optional(),
});

export type CreateReviewType = z.infer<typeof CreateReviewSchema>;
