"use server";

import { SESSION_KEY } from "@/lib/constants";
import { cookies } from "next/headers";

export async function createSession(userData: any) {
  const cookieStore = await cookies();
  // Store the session data in a cookie named from SESSION_KEY
  // This matches what proxy.ts expects
  cookieStore.set(SESSION_KEY, JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}
