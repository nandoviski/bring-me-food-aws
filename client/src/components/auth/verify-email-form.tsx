"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  email: string;
  username: string;
  onVerifySuccess?: () => void;
  onBackToSignUp?: () => void;
};

export function VerifyEmailForm({
  email,
  username,
  onVerifySuccess,
  onBackToSignUp,
}: Props) {
  const { confirmEmail, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState("");
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!code) {
      setLocalError("Verification code is required");
      return;
    }

    if (code.length < 6) {
      setLocalError("Verification code should be at least 6 characters");
      return;
    }

    try {
      await confirmEmail(username, code);
      setResendSuccess(false);
      onVerifySuccess?.();
    } catch (err: any) {
      setLocalError(
        err.message || error || "Failed to verify email. Please try again."
      );
    }
  };

  const handleResend = async () => {
    setLocalError(null);
    clearError();
    setResendSuccess(false);

    if (resendAttempts >= 3) {
      setLocalError(
        "Too many resend attempts. Please try again later or contact support."
      );
      return;
    }

    setResendLoading(true);
    try {
      const { handleResendSignUpCode } = await import("@/lib/amplify-config");
      await handleResendSignUpCode(username);
      setResendAttempts((prev) => prev + 1);
      setResendSuccess(true);
      setCode("");
    } catch (err: any) {
      setLocalError(
        err.message || "Failed to resend code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <p className="text-sm font-medium">Verify your email address</p>
        <p className="text-sm mt-1">
          We've sent a confirmation code to <strong>{email}</strong>. Enter it
          below to verify your email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setLocalError(null);
              clearError();
              setResendSuccess(false);
            }}
            disabled={isLoading}
            required
            maxLength={6}
            className="font-mono text-lg tracking-widest"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the 6-digit code from your email
          </p>
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {displayError}
          </div>
        )}

        {resendSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
            Code resent successfully! Check your email.
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || code.length < 6}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-600">Didn't receive a code?</p>
        <Button
          type="button"
          variant="outline"
          disabled={resendLoading || resendAttempts >= 3}
          onClick={handleResend}
          className="w-full"
        >
          {resendLoading
            ? "Sending..."
            : `Resend Code${resendAttempts > 0 ? ` (${3 - resendAttempts} left)` : ""}`}
        </Button>
      </div>

      <div className="text-center border-t pt-4">
        <p className="text-sm text-gray-600">
          <button
            onClick={onBackToSignUp}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
