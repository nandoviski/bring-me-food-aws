"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { User } from "@/schema";
import type { SignUpType } from "@/schema";
import {
  getIdToken,
  handleGetCurrentUser,
  handleSignUp,
  handleConfirmSignUp,
  handleSignIn,
  handleSignOut,
} from "./amplify-config";
// Amplify is configured at module load time in amplify-config.ts
import "./amplify-config";

type UserComplete = User & { customer?: any; chef?: any; isChef?: boolean };

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "bmf_user";
const ACCESS_TOKEN_KEY = "bmf_access_token";

/**
 * Check if JWT token is expired by examining the exp claim
 * Returns true if token is valid, false if expired or invalid structure
 */
function isTokenValid(token: string): boolean {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return false; // Invalid token structure
    }

    // Decode the payload (second part)
    const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    // Check if token has expiration claim
    if (!payload.exp) {
      return false; // No expiration claim
    }

    // exp is in seconds, Date.now() is in milliseconds
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch {
    return false; // Any parsing error means invalid token
  }
}

/**
 * Extract user info from JWT token payload
 */
function extractTokenPayload(token: string): {
  userType: "chef" | "customer" | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
} {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3)
      return {
        userType: null,
        fullName: null,
        firstName: null,
        lastName: null,
      };

    const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    const userType = payload["custom:userType"];
    return {
      userType:
        userType === "chef" || userType === "customer" ? userType : null,
      fullName: payload.name || null,
      firstName: payload.given_name || null,
      lastName: payload.family_name || null,
    };
  } catch {
    return { userType: null, fullName: null, firstName: null, lastName: null };
  }
}

/**
 * Sync user data with backend and retrieve complete user profile
 * Can be called with or without signupData
 * - With signupData: Used during signup to create profile with full form data
 * - Without signupData: Used during login to retrieve existing profile
 */
async function syncUserWithBackend(
  cognitoEmail: string,
  accessToken: string,
  signupData?: SignUpType,
): Promise<UserComplete | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    if (!apiBaseUrl) {
      throw new Error(
        "API base URL is not configured (NEXT_PUBLIC_API_BASE_URL)",
      );
    }

    // Extract user info from token
    const { userType, fullName, firstName, lastName } =
      extractTokenPayload(accessToken);

    const requestBody: any = {
      email: cognitoEmail,
      userType: signupData?.userType || userType,
      fullName: signupData?.userType === "chef" && "fullName" in signupData ? signupData.fullName : fullName,
      firstName: signupData?.userType === "customer" && "firstName" in signupData ? signupData.firstName : firstName,
      lastName: signupData?.userType === "customer" && "lastName" in signupData ? signupData.lastName : lastName,
    };

    // If signupData is provided (signup flow), include it in the request
    if (signupData) {
      requestBody.signupData = signupData;
    }

    const response = await fetch(`${apiBaseUrl}/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Sync failed with status ${response.status}: ${response.statusText}. Response: ${errorBody}`,
      );
    }

    const userData = await response.json();
    return userData.user || userData;
  } catch (error: any) {
    console.error("Failed to sync user with backend:", error);
    // Provide more specific error messages for common issues
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.error(
        "Network error - Backend server may not be running or CORS is misconfigured",
      );
      throw new Error(
        `Unable to connect to backend server at ${apiBaseUrl}. Make sure the backend is running.`,
      );
    }
    // Re-throw the error so the caller knows sync failed
    throw error;
  }
}

/**
 * Save access token to localStorage for API requests
 */
function saveAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

/**
 * Retrieve access token from localStorage
 */
function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserComplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        setIsLoading(true);

        // Amplify is already configured at module load time
        // Try to get stored token first
        const storedToken = getStoredAccessToken();
        if (storedToken) {
          setAccessToken(storedToken);
        }

        // Try to restore user from Cognito
        const cognitoUser = await handleGetCurrentUser();
        if (cognitoUser) {
          // User is authenticated with Cognito
          // Sync with backend to get full user profile
          const token = storedToken || (await getIdToken());
          if (token) {
            // Check if token is expired before using it
            if (!isTokenValid(token)) {
              saveAccessToken(null);
              setIsLoading(false);
              return;
            }

            setAccessToken(token);
            saveAccessToken(token);

            // Decode the ID token to get the email claim (required for sync-user endpoint)
            let userEmail: string = cognitoUser.username || "";
            try {
              const tokenParts = token.split(".");
              if (tokenParts.length === 3) {
                const base64 = tokenParts[1]
                  .replace(/-/g, "+")
                  .replace(/_/g, "/");
                const payload = JSON.parse(atob(base64));
                if (payload.email) {
                  userEmail = payload.email;
                }
              }
            } catch (err) {
              console.warn("Failed to extract email from stored token");
            }

            if (userEmail) {
              const fullUser = await syncUserWithBackend(userEmail, token);
              if (fullUser) {
                setUser(fullUser);
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(fullUser));
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Sync user state to sessionStorage when it changes
  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      console.error("Failed to update session:", e);
    }
  }, [user]);

  const signUp = useCallback(
    async (
      email: string,
      username: string,
      password: string,
      fullName: string,
      userType?: "chef" | "customer",
      signupData?: SignUpType,
    ) => {
      try {
        setError(null);
        setIsLoading(true);

        await handleSignUp({ email, username, password, fullName, userType });

        // After successful Cognito signup, create profile with full signup data
        if (signupData) {
          // Get the ID token to sync with backend
          let token: string | null = null;
          let retries = 3;
          while (!token && retries > 0) {
            token = await getIdToken();
            if (!token) {
              retries--;
              if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 200));
              }
            }
          }

          if (!token) {
            throw new Error(
              "Failed to get ID token after signup. Profile creation may have failed. You can complete this by logging in.",
            );
          }

          // Verify token is valid before using it
          if (!isTokenValid(token)) {
            throw new Error(
              "Session token is invalid after signup. Please try logging in.",
            );
          }

          // Sync with backend to create profile with signup data
          const fullUser = await syncUserWithBackend(email, token, signupData);
          if (fullUser) {
            setUser(fullUser);
            setAccessToken(token);
            saveAccessToken(token);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(fullUser));
          }
        }

        // Don't set user if no signupData; they need to confirm email first
      } catch (err: any) {
        const errorMessage = err.message || "Sign up failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const confirmEmail = useCallback(async (username: string, code: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Confirm the email first
      await handleConfirmSignUp(username, code);
    } catch (err: any) {
      const errorMessage =
        err.message || "Email confirmation failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (emailOrUsername: string, password: string) => {
      try {
        setError(null);
        setIsLoading(true);

        try {
          await handleSignIn({ emailOrUsername, password });
        } catch (signInErr: any) {
          // Re-throw sign-in errors with their original message
          // (e.g., "User is not confirmed", invalid credentials, etc.)
          throw signInErr;
        }

        // Wait briefly for session to be established (Cognito timing issue)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get ID token with retry logic (ID token contains email claim needed for verification)
        let token: string | null = null;
        let retries = 3;
        while (!token && retries > 0) {
          token = await getIdToken();
          if (!token) {
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
          }
        }

        if (!token) {
          throw new Error(
            "Failed to get ID token. Please ensure you are signed in correctly.",
          );
        }

        // Verify token is valid (not expired) before using it
        if (!isTokenValid(token)) {
          throw new Error("Session token is invalid. Please log in again.");
        }

        setAccessToken(token);
        saveAccessToken(token);

        // Sync with backend to get full user profile
        // Decode the ID token to get the email claim (required for sync-user endpoint)
        let userEmail: string;
        try {
          // Parse the JWT token to extract the email claim
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            // Decode base64url (replace - and _ for standard base64)
            const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));
            userEmail = payload.email || emailOrUsername;
          } else {
            userEmail = emailOrUsername;
          }
        } catch (err) {
          console.warn("Failed to extract email from token, using input email");
          userEmail = emailOrUsername;
        }

        const fullUser = await syncUserWithBackend(userEmail, token);
        if (fullUser) {
          setUser(fullUser);
        } else {
          throw new Error("Failed to fetch user profile from backend");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Login failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      setError(null);
      await handleSignOut();
      setUser(null);
      setAccessToken(null);
      saveAccessToken(null);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err: any) {
      const errorMessage = err.message || "Logout failed.";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    signUp,
    confirmEmail,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    accessToken,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
