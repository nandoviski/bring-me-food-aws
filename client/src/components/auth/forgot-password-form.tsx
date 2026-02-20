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
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) return setError("Email is required");
    if (!newPassword) return setError("New password is required");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");
    if (newPassword !== confirm) return setError("Passwords don't match");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <span className="text-2xl">✓</span>
        </div>
        <h4 className="font-semibold text-gray-900">Password reset!</h4>
        <p className="text-sm text-gray-500">You can now sign in with your new password.</p>
        <Button className="w-full" onClick={onBackToLogin}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Enter your email and choose a new password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="reset-email">Email Address</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="reset-new-password">New Password</Label>
          <Input
            id="reset-new-password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
          <Input
            id="reset-confirm-password"
            type="password"
            placeholder="Repeat new password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(null); }}
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
          {isLoading ? "Resetting…" : "Reset Password"}
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
