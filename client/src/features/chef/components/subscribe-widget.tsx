"use client";

import { useState } from "react";
import { Mail, CheckCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscribeToChefMutation } from "@/state/api";
import { toast } from "sonner";

interface SubscribeWidgetProps {
  chefId: string;
  chefName: string;
}

/** Validate E.164 loosely — starts with + and 7-15 digits */
function isValidPhone(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value.replace(/\s+/g, ""));
}

export function SubscribeWidget({ chefId, chefName }: SubscribeWidgetProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [triggerSubscribe, { isLoading }] = useSubscribeToChefMutation();

  function handlePhoneChange(value: string) {
    setPhone(value);
    if (value && !isValidPhone(value)) {
      setPhoneError("Use international format: +61412345678");
    } else {
      setPhoneError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (phone && !isValidPhone(phone)) {
      setPhoneError("Use international format: +61412345678");
      return;
    }

    try {
      await triggerSubscribe({
        chefId,
        email: email.trim(),
        name: name.trim() || undefined,
        phone: phone.trim() ? phone.trim().replace(/\s+/g, "") : undefined,
      }).unwrap();
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
          You&apos;ll get {chefName}&apos;s weekly menu to{" "}
          <strong>{email}</strong>
          {phone ? <> and by SMS to <strong>{phone}</strong></> : ""}.
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

        {/* Optional SMS field */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Also get it by text (optional)</span>
          </div>
          <Input
            type="tel"
            placeholder="+61 412 345 678"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`bg-white ${phoneError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
            disabled={isLoading}
          />
          {phoneError && (
            <p className="text-xs text-red-500">{phoneError}</p>
          )}
          {!phoneError && phone && (
            <p className="text-xs text-green-600">✓ You&apos;ll receive menu updates by SMS too</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          disabled={isLoading || !email.trim() || !!phoneError}
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
