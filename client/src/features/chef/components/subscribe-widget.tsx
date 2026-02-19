"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscribeToChefMutation } from "@/state/api";
import { toast } from "sonner";

interface SubscribeWidgetProps {
  chefId: string;
  chefName: string;
}

export function SubscribeWidget({ chefId, chefName }: SubscribeWidgetProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [triggerSubscribe, { isLoading }] = useSubscribeToChefMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await triggerSubscribe({ chefId, email: email.trim(), name: name.trim() || undefined }).unwrap();
      setSubscribed(true);
    } catch (err: any) {
      const msg = err?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    }
  }

  if (subscribed) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
        <h3 className="mb-1 text-lg font-semibold text-green-800">You&apos;re subscribed!</h3>
        <p className="text-sm text-green-700">
          You&apos;ll get {chefName}&apos;s weekly menu delivered to <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50 px-6 py-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Get the weekly menu</h3>
          <p className="text-sm text-slate-600">
            Subscribe to receive {chefName}&apos;s menu straight to your inbox.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white"
          disabled={isLoading}
        />
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white"
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? "Subscribing…" : "Subscribe to menu updates"}
        </Button>
        <p className="text-center text-xs text-slate-400">
          Free forever. No spam. Unsubscribe any time.
        </p>
      </form>
    </div>
  );
}
