"use client";

import { useState } from "react";
import { Tag, Plus, X, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useListPromoCodesQuery,
  useCreatePromoCodeMutation,
  useDeactivatePromoCodeMutation,
} from "@/state/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function PromoCodesManager() {
  const { data, isLoading, isError } = useListPromoCodesQuery();
  const [createPromo, { isLoading: isCreating }] = useCreatePromoCodeMutation();
  const [deactivate, { isLoading: isDeactivating }] = useDeactivatePromoCodeMutation();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const valueNum = parseFloat(discountValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setFormError("Discount value must be a positive number");
      return;
    }
    if (discountType === "PERCENTAGE" && valueNum > 100) {
      setFormError("Percentage discount cannot exceed 100%");
      return;
    }

    try {
      await createPromo({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: valueNum,
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }).unwrap();

      toast.success(`Promo code "${code.toUpperCase()}" created!`);
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      setExpiresAt("");
      setShowForm(false);
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to create promo code";
      toast.error(msg);
      setFormError(msg);
    }
  }

  async function handleDeactivate(codeId: string, codeName: string) {
    if (!confirm(`Deactivate promo code "${codeName}"? Customers won't be able to use it anymore.`)) return;
    try {
      await deactivate({ codeId }).unwrap();
      toast.success(`"${codeName}" deactivated`);
    } catch {
      toast.error("Failed to deactivate promo code");
    }
  }

  const codes = data?.codes ?? [];
  const activeCodes = codes.filter((c) => c.active);
  const inactiveCodes = codes.filter((c) => !c.active);

  if (isLoading) return <div className="animate-pulse rounded-lg bg-slate-100 h-40" />;
  if (isError) return <p className="text-sm text-red-500">Failed to load promo codes.</p>;

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {activeCodes.length} active code{activeCodes.length !== 1 ? "s" : ""}
        </p>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New promo code"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Create a new promo code</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Code */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Code *</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  required
                  className="bg-white uppercase"
                  maxLength={30}
                />
                <p className="mt-1 text-xs text-slate-400">Letters, numbers, hyphens only</p>
              </div>

              {/* Discount type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Discount type *</label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (e.g. 20%)</SelectItem>
                    <SelectItem value="FIXED">Fixed amount (e.g. $5 off)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount value */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  {discountType === "PERCENTAGE" ? "Percentage off *" : "Amount off ($) *"}
                </label>
                <div className="relative">
                  {discountType === "FIXED" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  )}
                  <Input
                    type="number"
                    min={1}
                    max={discountType === "PERCENTAGE" ? 100 : undefined}
                    step={discountType === "PERCENTAGE" ? 1 : 0.5}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "PERCENTAGE" ? "20" : "5.00"}
                    required
                    className={`bg-white ${discountType === "FIXED" ? "pl-7" : ""}`}
                  />
                  {discountType === "PERCENTAGE" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                  )}
                </div>
              </div>

              {/* Max uses */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Max uses <span className="text-slate-400">(optional)</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  className="bg-white"
                />
              </div>

              {/* Expiry date */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Expiry date <span className="text-slate-400">(optional)</span>
                </label>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="bg-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {formError}
              </div>
            )}

            <Button type="submit" disabled={isCreating || !code.trim() || !discountValue}
              className="bg-orange-500 hover:bg-orange-600 text-white">
              {isCreating ? "Creating…" : "Create promo code"}
            </Button>
          </form>
        </div>
      )}

      {/* Empty state */}
      {codes.length === 0 && !showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Tag className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h3 className="mb-2 font-semibold text-slate-900">No promo codes yet</h3>
          <p className="mx-auto max-w-sm text-sm text-slate-500">
            Create discount codes to share with new customers, run promotions, or reward loyal regulars.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first promo code
          </Button>
        </div>
      )}

      {/* Active codes */}
      {activeCodes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active codes
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {activeCodes.map((promo) => (
              <PromoCodeRow
                key={promo.id}
                promo={promo}
                onDeactivate={() => handleDeactivate(promo.id, promo.code)}
                isDeactivating={isDeactivating}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Inactive codes */}
      {inactiveCodes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white opacity-60">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Deactivated codes
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {inactiveCodes.map((promo) => (
              <PromoCodeRow
                key={promo.id}
                promo={promo}
                onDeactivate={() => {}}
                isDeactivating={false}
                inactive
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface PromoCodeRowProps {
  promo: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    expiresAt: string | null;
    active: boolean;
    createdAt: string;
  };
  onDeactivate: () => void;
  isDeactivating: boolean;
  inactive?: boolean;
}

function PromoCodeRow({ promo, onDeactivate, isDeactivating, inactive }: PromoCodeRowProps) {
  const discountLabel = promo.discountType === "PERCENTAGE"
    ? `${promo.discountValue}% off`
    : `$${promo.discountValue.toFixed(2)} off`;

  const isExpired = promo.expiresAt && new Date() > new Date(promo.expiresAt);

  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
        <Tag className="h-4 w-4 text-orange-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm font-semibold text-slate-900">{promo.code}</p>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${
            inactive ? "bg-slate-100 text-slate-500" : "bg-orange-100 text-orange-700"
          }`}>
            {discountLabel}
          </Badge>
          {isExpired && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-100 text-red-600">
              Expired
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
          <span>
            Used {promo.usedCount} time{promo.usedCount !== 1 ? "s" : ""}
            {promo.maxUses !== null ? ` of ${promo.maxUses}` : " (unlimited)"}
          </span>
          {promo.expiresAt && (
            <span>
              Expires {new Date(promo.expiresAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          <span>
            Created {new Date(promo.createdAt).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </div>
      {!inactive && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
          onClick={onDeactivate}
          disabled={isDeactivating}
          title="Deactivate this code"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {inactive && (
        <div className="shrink-0">
          <CheckCircle className="h-4 w-4 text-slate-300" />
        </div>
      )}
    </li>
  );
}
