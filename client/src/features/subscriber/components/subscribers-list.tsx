"use client";

import { Mail, Users } from "lucide-react";
import { useGetSubscribersQuery } from "@/state/api";
import { useAuth } from "@/lib/auth";

export function SubscribersList() {
  const { user: loggedUser } = useAuth();

  if (!loggedUser?.chef) {
    return <p className="text-muted-foreground">You must be logged in as a chef to view subscribers.</p>;
  }

  const { data, isLoading, isError } = useGetSubscribersQuery({ chefId: loggedUser.chef.id });

  if (isLoading) {
    return <div className="animate-pulse rounded-lg bg-slate-100 h-40" />;
  }

  if (isError) {
    return <p className="text-sm text-red-500">Failed to load subscribers. Please try again.</p>;
  }

  const count = data?.count ?? 0;
  const subscribers = data?.subscribers ?? [];

  return (
    <div className="space-y-4">
      {/* Stats banner */}
      <div className="flex items-center gap-4 rounded-xl border border-orange-100 bg-orange-50 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{count}</p>
          <p className="text-sm text-slate-600">
            {count === 1 ? "subscriber" : "subscribers"} will receive your next menu email
          </p>
        </div>
      </div>

      {/* How it works */}
      {count === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Mail className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h3 className="mb-2 font-semibold text-slate-900">No subscribers yet</h3>
          <p className="mx-auto max-w-sm text-sm text-slate-500">
            Share your chef profile link with customers. Anyone who visits your page can
            subscribe to get your weekly menu by email.
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-400">Your profile link:</p>
            <p className="text-sm font-medium text-orange-600">
              bringmefood.app/chef/{loggedUser.chef.username}
            </p>
          </div>
        </div>
      )}

      {/* Subscriber table */}
      {count > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {count} active subscriber{count !== 1 ? "s" : ""}
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {subscribers.map((sub) => (
              <li key={sub.id} className="flex items-center gap-3 px-6 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {(sub.name ?? sub.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  {sub.name && (
                    <p className="truncate text-sm font-medium text-slate-900">{sub.name}</p>
                  )}
                  <p className="truncate text-sm text-slate-500">{sub.email}</p>
                </div>
                <p className="shrink-0 text-xs text-slate-400">
                  {new Date(sub.createdAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
