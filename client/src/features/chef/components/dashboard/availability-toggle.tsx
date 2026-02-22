"use client";

import { useAuth } from "@/lib/auth";
import { useGetChefByUserIdQuery, useUpdateChefAvailabilityMutation } from "@/state/api";
import { toast } from "sonner";
import { CheckCircle, PauseCircle } from "lucide-react";

export function AvailabilityToggle() {
  const { user } = useAuth();
  const { data: chef } = useGetChefByUserIdQuery({ userId: user?.id ?? "" }, { skip: !user?.id });
  const [updateAvailability, { isLoading }] = useUpdateChefAvailabilityMutation();

  if (!chef) return null;

  const handleToggle = async () => {
    try {
      const newValue = !chef.available;
      await updateAvailability({ chefId: chef.id, available: newValue }).unwrap();
      toast.success(
        newValue
          ? "You're now accepting orders 🟢"
          : "You're now on break — you won't appear in search 🟡",
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const isAvailable = chef.available ?? true;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
        isAvailable
          ? "border-green-200 bg-green-50 hover:bg-green-100"
          : "border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {isAvailable ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <PauseCircle className="h-5 w-5 text-yellow-600" />
        )}
        <div>
          <p className={`text-sm font-semibold ${isAvailable ? "text-green-800" : "text-yellow-800"}`}>
            {isAvailable ? "Accepting orders" : "On break"}
          </p>
          <p className={`text-xs ${isAvailable ? "text-green-600" : "text-yellow-600"}`}>
            {isAvailable
              ? "Customers can find you and order. Click to pause."
              : "You're hidden from search. Click to go live."}
          </p>
        </div>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          isAvailable
            ? "bg-green-200 text-green-800"
            : "bg-yellow-200 text-yellow-800"
        }`}
      >
        {isAvailable ? "Go on break →" : "Go live →"}
      </span>
    </button>
  );
}
