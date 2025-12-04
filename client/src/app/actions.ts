"use server";

import { cookies } from "next/headers";

export async function createSession(userData: any) {
  const cookieStore = await cookies();
  // Store the session data in a cookie named "session"
  // This matches what proxy.ts expects
  cookieStore.set("session", JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
