"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSignUpSuccess?: (email: string) => void;
  onSwitchToLogin?: () => void;
};

export function SignUpForm({ onSignUpSuccess, onSwitchToLogin }: Props) {
  const { signUp, isLoading, error, clearError } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain an uppercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain a number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Password must contain a special character";
    }
    return null;
  };

  const validateUsername = (uname: string): string | null => {
    if (uname.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (uname.length > 20) {
      return "Username must be at most 20 characters";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(uname)) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validation
    if (!fullName) {
      setLocalError("Full name is required");
      return;
    }

    if (!email) {
      setLocalError("Email is required");
      return;
    }

    if (!username) {
      setLocalError("Username is required");
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      setLocalError(usernameError);
      return;
    }

    if (!password) {
      setLocalError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setLocalError(passwordError);
      return;
    }

    try {
      await signUp(email, username, password, fullName);
      onSignUpSuccess?.(email);
    } catch (err: any) {
      // Error is already set in auth context
      setLocalError(
        err.message || error || "Failed to sign up. Please try again."
      );
    }
  };

  const displayError = localError || error;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setLocalError(null);
              clearError();
            }}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError(null);
              clearError();
            }}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="3-20 characters (letters, numbers, _ -)"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setLocalError(null);
              clearError();
            }}
            disabled={isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            3-20 characters, letters, numbers, underscores, hyphens only
          </p>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters with uppercase, number, and special character"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLocalError(null);
              clearError();
            }}
            disabled={isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Must contain: 8+ characters, uppercase letter, number, special
            character
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
