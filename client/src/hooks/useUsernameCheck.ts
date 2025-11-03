import { useRef, useState } from "react";
import { useLazyGetUsernameExistsQuery } from "@/state/api";

export type UsernameStatus =
  | "idle"
  | "checking"
  | "taken"
  | "available"
  | "error";

export function useUsernameCheck() {
  const [trigger] = useLazyGetUsernameExistsQuery();
  const lastRequestId = useRef(0);
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function check(username: string) {
    const trimmed = username?.trim();
    if (!trimmed) {
      setStatus("idle");
      setError(null);
      return { exists: false };
    }

    const requestId = ++lastRequestId.current;
    setStatus("checking");
    setError(null);

    try {
      const res = await trigger({ username: trimmed }).unwrap();
      if (requestId !== lastRequestId.current) return { exists: false }; // stale

      if (res && res.exists) {
        setStatus("taken");
        return { exists: true };
      }

      setStatus("available");
      return { exists: false };
    } catch (err: any) {
      if (requestId !== lastRequestId.current) return { exists: false };
      setStatus("error");
      setError(err?.data?.message ?? err?.error ?? "Unknown error");
      return { exists: false };
    }
  }

  return { check, status, error } as const;
}
