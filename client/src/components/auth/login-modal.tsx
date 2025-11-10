"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function LoginModal({ compact }: { compact?: boolean }) {
  const { user, login, logout, availableUsers } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            {user.customer?.firstName ?? user.chef?.name ?? user.email}
          </span>
          <Button variant="ghost" onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant={compact ? "green" : "green"}
            onClick={() => setOpen(true)}
          >
            {/* px-6 py-3 font-medium */}
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
                <div className="relative z-10 w-full max-w-md rounded bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-lg font-medium">
                    Select a user to sign in
                  </h3>
                  <div className="space-y-3">
                    {availableUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">
                            {u.chef?.name ?? u.customer?.firstName ?? u.email}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {u.email}
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              login(u.id);
                              setOpen(false);
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setOpen(false)}>Close</Button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}
