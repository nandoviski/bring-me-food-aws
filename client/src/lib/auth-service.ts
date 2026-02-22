/**
 * Simple auth API — replaces AWS Amplify.
 * Talks directly to our Express backend.
 */

const BASE = () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  emailVerified: boolean;
  isChef: boolean;
  isAdmin: boolean;
  chef: any | null;
  customer: any | null;
};

export type AuthResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
};

async function post(path: string, body: object): Promise<Response> {
  return fetch(`${BASE()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function get(path: string, token: string): Promise<Response> {
  return fetch(`${BASE()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiSignUp(data: Record<string, any>): Promise<AuthResponse> {
  const res = await post("/auth/signup", data);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Sign up failed");
  return json;
}

export async function apiSignIn(identifier: string, password: string): Promise<AuthResponse> {
  const res = await post("/auth/signin", {
    email: identifier,
    username: identifier,
    password,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Sign in failed");
  return json;
}

export async function apiMe(token: string): Promise<AuthUser | null> {
  try {
    const res = await get("/auth/me", token);
    if (!res.ok) return null;
    const json = await res.json();
    return json.user ?? null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !payload.exp || Math.floor(Date.now() / 1000) >= payload.exp;
  } catch {
    return true;
  }
}
