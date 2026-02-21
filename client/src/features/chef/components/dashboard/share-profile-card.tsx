"use client";

import { useState } from "react";
import { ExternalLink, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/**
 * A card displayed on the chef dashboard showing their public profile URL
 * with a one-click copy button. Helps chefs share their link with customers.
 */
export function ShareProfileCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user?.chef?.username) return null;

  const username = user.chef.username;

  // In production this will be the real domain; in dev it'll be localhost
  const isProduction = typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1");

  const baseUrl = isProduction
    ? `https://bringmefood.app`
    : `http://${typeof window !== "undefined" ? window.location.host : "localhost:3000"}`;

  const profileUrl = `${baseUrl}/chef/${username}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select text in a temp input
      const el = document.createElement("input");
      el.value = profileUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 mb-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500">
          <Link2 className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Your public page</p>
          <p className="truncate text-sm font-medium text-slate-800">
            {profileUrl}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-orange-200 bg-white text-slate-700 hover:bg-orange-50"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-3.5 w-3.5" />
              Copy link
            </>
          )}
        </Button>
        <Button
          size="sm"
          className="gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
          asChild
        >
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </a>
        </Button>
      </div>
    </div>
  );
}
