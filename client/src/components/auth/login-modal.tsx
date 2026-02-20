"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { SignUpForm } from "./sign-up-form";
import { VerifyEmailForm } from "./verify-email-form";
import { LoginForm } from "./login-form";
import { ForgotPasswordForm } from "./forgot-password-form";

type AuthMode = "login" | "signup" | "verify" | "forgot";

type VerifyState = {
  email: string;
  username: string;
};

export default function LoginModal({ compact }: { compact?: boolean }) {
  const { user, logout, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [verifyState, setVerifyState] = useState<VerifyState | null>(null);

  const handleSignUpSuccess = (_email: string, _username: string) => {
    // With our own auth, signup immediately creates a session — just close the modal.
    handleLoginSuccess();
  };

  const handleVerifySuccess = () => {
    setAuthMode("login");
    setVerifyState(null);
  };

  const handleLoginSuccess = () => {
    setOpen(false);
    setAuthMode("login");
    setVerifyState(null);
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            {user.customer?.firstName ?? user.chef?.name ?? user.email}
          </span>
          <Button
            variant="ghost"
            onClick={() => logout()}
            disabled={isLoading}
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant={compact ? "green" : "green"}
            onClick={() => {
              setOpen(true);
              setAuthMode("login");
              setVerifyState(null);
            }}
          >
            Sign In
          </Button>

          {open &&
            typeof document !== "undefined" &&
            createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setOpen(false)}
                />
                <div className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-lg flex flex-col max-h-[90vh]">
                  {/* Sticky header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-semibold">
                      {authMode === "login" && "Sign In"}
                      {authMode === "signup" && "Create Account"}
                      {authMode === "verify" && "Verify Email"}
                      {authMode === "forgot" && "Reset Password"}
                    </h3>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Scrollable body */}
                  <div className="overflow-y-auto flex-1 px-6 py-4">
                    {authMode === "login" && (
                      <LoginForm
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToSignUp={() => setAuthMode("signup")}
                        onForgotPassword={() => setAuthMode("forgot")}
                      />
                    )}

                    {authMode === "signup" && (
                      <SignUpForm
                        onSignUpSuccess={handleSignUpSuccess}
                        onSwitchToLogin={() => setAuthMode("login")}
                      />
                    )}

                    {authMode === "verify" && verifyState && (
                      <VerifyEmailForm
                        email={verifyState.email}
                        username={verifyState.username}
                        onVerifySuccess={handleVerifySuccess}
                        onBackToSignUp={() => setAuthMode("signup")}
                      />
                    )}

                    {authMode === "forgot" && (
                      <ForgotPasswordForm
                        onBackToLogin={() => setAuthMode("login")}
                      />
                    )}
                  </div>
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
}
