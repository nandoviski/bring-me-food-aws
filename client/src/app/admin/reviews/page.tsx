"use client";

import { useState } from "react";
import {
  useGetAdminReviewsQuery,
  useToggleReviewVisibilityMutation,
  useDeleteReviewMutation,
} from "@/state/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, MoreVertical, Eye, EyeOff, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { StarRating } from "@/features/review/components/star-rating";

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [filterHidden, setFilterHidden] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useGetAdminReviewsQuery({
    page,
    limit: 20,
    hidden: filterHidden,
  });

  const [toggleVisibility] = useToggleReviewVisibilityMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  const handleToggle = async (id: string, currentHidden: boolean) => {
    try {
      await toggleVisibility({ id, hidden: !currentHidden }).unwrap();
    } catch (err) {
      console.error("Failed to toggle visibility", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this review? This cannot be undone.")) return;
    try {
      await deleteReview(id).unwrap();
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500">
            {pagination?.total ?? 0} review{pagination?.total !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterHidden === undefined ? "default" : "outline"}
            onClick={() => { setFilterHidden(undefined); setPage(1); }}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterHidden === false ? "default" : "outline"}
            onClick={() => { setFilterHidden(false); setPage(1); }}
          >
            Visible
          </Button>
          <Button
            size="sm"
            variant={filterHidden === true ? "default" : "outline"}
            onClick={() => { setFilterHidden(true); setPage(1); }}
          >
            Hidden
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No reviews found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Chef</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} className={review.hidden ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{review.authorName}</TableCell>
                    <TableCell>
                      <a
                        href={`/chef/${review.chef.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        {review.chef.name}
                      </a>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} size="sm" />
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {review.comment || (
                          <span className="italic text-gray-400">No comment</span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {format(new Date(review.createdAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.hidden ? "destructive" : "default"}>
                        {review.hidden ? "Hidden" : "Visible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggle(review.id, review.hidden)}
                          >
                            {review.hidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Show review
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Hide review
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(review.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
