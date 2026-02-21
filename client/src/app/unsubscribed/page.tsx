"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Smartphone } from "lucide-react";

function UnsubscribedContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const chefUsername = params.get("chef");
  const email = params.get("email");
  const channel = params.get("channel"); // "sms" | null (null = email)

  const isError = status === "error";
  const isSms = channel === "sms";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        {isError ? (
          <>
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h1 className="mb-2 text-xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-500">
              We couldn&apos;t process your unsubscribe request. Please try again later.
            </p>
          </>
        ) : isSms ? (
          <>
            <Smartphone className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h1 className="mb-2 text-xl font-semibold text-gray-900">SMS opted out</h1>
            <p className="text-sm text-gray-500">
              You&apos;ve been removed from this chef&apos;s SMS list.
              You won&apos;t receive any more menu text messages.
              Your email subscription (if any) is unchanged.
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h1 className="mb-2 text-xl font-semibold text-gray-900">Unsubscribed</h1>
            <p className="text-sm text-gray-500">
              {email ? (
                <>
                  <strong>{email}</strong> has been removed from this chef&apos;s mailing list.
                  You won&apos;t receive any more menu emails.
                </>
              ) : (
                "You've been unsubscribed from this chef's mailing list."
              )}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {chefUsername && !isError && (
            <Link
              href={`/chef/${chefUsername}`}
              className="rounded-lg bg-orange-500 px-4 py-3 text-sm font-medium text-white hover:bg-orange-600"
            >
              Visit chef&apos;s page
            </Link>
          )}
          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading…</div>
      </div>
    }>
      <UnsubscribedContent />
    </Suspense>
  );
}
