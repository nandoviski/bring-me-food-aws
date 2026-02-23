"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useGetCustomerOrdersQuery } from "@/state/api";
import OrderCard from "@/features/customer/components/order-card";
import { ReviewForm } from "@/features/review/components/review-form";
import { MessageSquarePlus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.orderId as string | undefined;
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { user: loggedUser } = useAuth();

  if (!loggedUser) {
    return (
      <div className="p-6">You must be logged in to access this page.</div>
    );
  }

  const {
    data: orders,
    isLoading,
    isFetching,
    error,
  } = useGetCustomerOrdersQuery(
    { userId: loggedUser.id },
    { skip: !loggedUser },
  );

  if (isLoading || isFetching) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading order</div>;

  const order = orders?.find((o) => o.id === orderId);

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  const canReview =
    order.status === "DELIVERED" || order.status === "CONFIRMED";

  const customerName = loggedUser?.customer
    ? (loggedUser.customer as any).firstName
    : undefined;

  return (
    <div className="container mx-auto mt-6 px-4 space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Order details</h1>
        <OrderCard order={order} />
      </div>

      {/* Review CTA — show for confirmed/delivered orders */}
      {canReview && (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900">Leave a review</p>
                <p className="text-sm text-gray-500">
                  How was your experience with this chef?
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewForm((v) => !v)}
              className="gap-1 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {showReviewForm ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Close
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Write review
                </>
              )}
            </Button>
          </div>

          {showReviewForm && (
            <div className="mt-5 border-t border-orange-100 pt-5">
              <ReviewForm
                chefId={(order as any).chefId || (order as any).chef?.id}
                chefName={(order as any).chef?.name || "this chef"}
                orderId={order.id}
                isLoggedIn
                customerName={customerName}
                onClose={() => setShowReviewForm(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
