"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onLoginSuccess?: () => void;
  onSwitchToSignUp?: () => void;
};

export function LoginForm({ onLoginSuccess, onSwitchToSignUp }: Props) {
  const { login, isLoading, error, clearError } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!emailOrUsername) {
      setLocalError("Email or username is required");
      return;
    }

    if (!password) {
      setLocalError("Password is required");
      return;
    }

    try {
      await login(emailOrUsername, password);
      onLoginSuccess?.();
    } catch (err: any) {
      // Error is already set in auth context
      setLocalError(
        err.message || error || "Failed to sign in. Please try again."
      );
    }
  };

  const displayError = localError || error;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="emailOrUsername">Email or Username</Label>
          <Input
            id="emailOrUsername"
            type="text"
            placeholder="your@email.com or username"
            value={emailOrUsername}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              setLocalError(null);
              clearError();
            }}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLocalError(null);
              clearError();
            }}
            disabled={isLoading}
            required
          />
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {displayError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
