"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError("Missing or invalid reset token. Please request a new link.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) return setError("Password must be at least 8 characters");
    if (newPassword !== confirm) return setError("Passwords don't match");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
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
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
        <h2 className="text-xl font-semibold text-gray-900">Password updated!</h2>
        <p className="text-sm text-gray-500">You can now sign in with your new password.</p>
        <Button className="w-full" onClick={() => router.push("/")}>Go to Sign In</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
          disabled={isLoading || !token}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Repeat new password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError(null); }}
          disabled={isLoading || !token}
          required
        />
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
          {error.includes("invalid or has expired") && (
            <span> <Link href="/" className="underline font-medium">Request a new one</Link></span>
          )}
        </div>
      )}

      <Button type="submit" disabled={isLoading || !token} className="w-full">
        {isLoading ? "Saving…" : "Set New Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="mt-1 text-sm text-gray-500">Choose a strong password for your account.</p>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-gray-400">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
