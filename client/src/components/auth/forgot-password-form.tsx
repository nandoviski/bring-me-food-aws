"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type Props = {
  onBackToLogin?: () => void;
};

export function ForgotPasswordForm({ onBackToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return setError("Email is required");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center py-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✉️
        </div>
        <h4 className="font-semibold text-gray-900">Check your email</h4>
        <p className="text-sm text-gray-500 leading-relaxed">
          If <span className="font-medium text-gray-700">{email}</span> has an account,
          we've sent a password reset link. It expires in 1 hour.
        </p>
        <p className="text-xs text-gray-400">Don't see it? Check your spam folder.</p>
        <Button variant="outline" className="w-full" onClick={onBackToLogin}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="forgot-email">Email Address</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={onBackToLogin}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}
