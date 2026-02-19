"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

function SignInContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const { user } = useAuth();
  const [view, setView] = useState<"signin" | "signup">("signin");

  // Already logged in → redirect
  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  function handleSuccess() {
    router.push(redirect);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-2xl font-bold text-orange-500">
            Bring Me Food
          </Link>
          <p className="mt-1 text-sm text-gray-500">
            {view === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {view === "signin" ? (
            <LoginForm
              onLoginSuccess={handleSuccess}
              onSwitchToSignUp={() => setView("signup")}
            />
          ) : (
            <SignUpForm
              onSignUpSuccess={() => handleSuccess()}
              onSwitchToLogin={() => setView("signin")}
            />
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Or{" "}
          <Link href={redirect.startsWith("/checkout") ? "/checkout" : "/"} className="text-orange-500 hover:underline">
            continue as guest
          </Link>
          {redirect.startsWith("/checkout") && " without an account"}
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading…</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
