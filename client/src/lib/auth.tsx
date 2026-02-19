"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { apiSignUp, apiSignIn, apiMe, isTokenExpired } from "./auth-service";
import type { AuthUser } from "./auth-service";
import type { SignUpType } from "@/schema";
import { createSession, deleteSession } from "@/app/actions";
import { ACCESS_TOKEN_KEY } from "./constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserComplete = AuthUser & { [key: string]: any };

export type AuthContextType = {
  user: UserComplete | null;
  signUp: (
    email: string,
    username: string,
    password: string,
    fullName: string,
    userType?: "chef" | "customer",
    signupData?: SignUpType,
  ) => Promise<void>;
  confirmEmail: (username: string, code: string) => Promise<void>;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  error: string | null;
  clearError: () => void;
};

// ─── Token helpers ────────────────────────────────────────────────────────────

function saveToken(token: string | null) {
  if (typeof window === "undefined") return;
  token
    ? localStorage.setItem(ACCESS_TOKEN_KEY, token)
    : localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserComplete | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Session restore on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      setIsLoading(true);
      try {
        const token = getStoredToken();
        if (token && !isTokenExpired(token)) {
          const userData = await apiMe(token);
          if (userData) {
            setUser(userData);
            setAccessToken(token);
            await createSession(userData);
          } else {
            saveToken(null);
          }
        } else {
          saveToken(null);
        }
      } catch {
        saveToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string,
    username: string,
    password: string,
    fullName: string,
    userType: "chef" | "customer" = "customer",
    signupData?: SignUpType,
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      const payload = signupData
        ? { ...signupData, email, username, password, userType }
        : { email, username, password, fullName, userType };

      const { token, user: userData } = await apiSignUp(payload);

      saveToken(token);
      setAccessToken(token);
      setUser(userData);
      await createSession(userData);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Confirm Email (no-op — no email verification with our own auth) ───────
  const confirmEmail = useCallback(async (_username: string, _code: string) => {
    // Not needed with our own JWT auth — kept for interface compatibility
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (emailOrUsername: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { token, user: userData } = await apiSignIn(emailOrUsername, password);

      saveToken(token);
      setAccessToken(token);
      setUser(userData);
      await createSession(userData);
    } catch (err: any) {
      setError(err.message || "Sign in failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setError(null);
    saveToken(null);
    setAccessToken(null);
    setUser(null);
    await deleteSession();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user, signUp, confirmEmail, login, logout,
      isLoading, isAuthenticated: !!user,
      accessToken, error, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
