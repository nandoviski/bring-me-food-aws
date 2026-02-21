"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Plus, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGetDeliveryZonesQuery, useUpdateDeliveryZonesMutation } from "@/state/api";

type Props = { chefId: string };

export default function DeliveryZonesManager({ chefId }: Props) {
  const { data, isLoading } = useGetDeliveryZonesQuery({ chefId });
  const [updateZones, { isLoading: isSaving }] = useUpdateDeliveryZonesMutation();

  const [mode, setMode] = useState<"ALL" | "ZONES">("ALL");
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [suburbInput, setSuburbInput] = useState("");
  const [cityInput, setCityInput] = useState("");

  useEffect(() => {
    if (data) {
      setMode(data.deliveryMode as "ALL" | "ZONES");
      setSuburbs(data.deliveryZones);
      setCities(data.deliveryCities);
    }
  }, [data]);

  const addSuburb = () => {
    const val = suburbInput.trim();
    if (!val) return;
    if (suburbs.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
      toast.error("Suburb already in list");
      return;
    }
    setSuburbs((prev) => [...prev, val]);
    setSuburbInput("");
  };

  const addCity = () => {
    const val = cityInput.trim();
    if (!val) return;
    if (cities.map(c => c.toLowerCase()).includes(val.toLowerCase())) {
      toast.error("City already in list");
      return;
    }
    setCities((prev) => [...prev, val]);
    setCityInput("");
  };

  const handleSave = async () => {
    try {
      await updateZones({
        chefId,
        data: { deliveryMode: mode, deliveryZones: suburbs, deliveryCities: cities },
      }).unwrap();
      toast.success("Delivery zones saved");
    } catch {
      toast.error("Failed to save delivery zones");
    }
  };

  if (isLoading) return <div className="text-sm text-slate-400 py-4">Loading delivery zones…</div>;

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode("ALL")}
          className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
            mode === "ALL"
              ? "border-[#1a2e25] bg-[#1a2e25]/5"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${mode === "ALL" ? "bg-[#1a2e25] text-white" : "bg-slate-100 text-slate-400"}`}>
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-sm">Deliver everywhere</div>
            <div className="text-xs text-slate-500 mt-0.5">Accept orders from any suburb</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("ZONES")}
          className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
            mode === "ZONES"
              ? "border-[#1a2e25] bg-[#1a2e25]/5"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${mode === "ZONES" ? "bg-[#1a2e25] text-white" : "bg-slate-100 text-slate-400"}`}>
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-sm">Specific suburbs only</div>
            <div className="text-xs text-slate-500 mt-0.5">You choose where you deliver</div>
          </div>
        </button>
      </div>

      {mode === "ZONES" && (
        <div className="space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-5">

          {/* Suburbs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Specific suburbs
              <span className="ml-1 text-xs text-slate-400 font-normal">(e.g. Bondi, Newtown, Surry Hills)</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={suburbInput}
                onChange={(e) => setSuburbInput(e.target.value)}
                placeholder="Type suburb name…"
                className="bg-white"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSuburb(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSuburb}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {suburbs.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {suburbs.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pl-3 pr-2 py-1 text-sm">
                    {s}
                    <button
                      type="button"
                      onClick={() => setSuburbs((prev) => prev.filter((x) => x !== s))}
                      className="ml-1 rounded-full hover:bg-slate-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">No suburbs added yet.</p>
            )}
          </div>

          {/* Cities */}
          <div className="border-t border-slate-200 pt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Entire cities / regions
              <span className="ml-1 text-xs text-slate-400 font-normal">(allows all suburbs in that city)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">
              E.g. add "Sydney" to accept orders from any Sydney suburb.
            </p>
            <div className="flex gap-2">
              <Input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Type city name…"
                className="bg-white"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCity(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {cities.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {cities.map((c) => (
                  <Badge key={c} variant="outline" className="gap-1 pl-3 pr-2 py-1 text-sm border-[#1a2e25] text-[#1a2e25]">
                    🏙 {c} (all suburbs)
                    <button
                      type="button"
                      onClick={() => setCities((prev) => prev.filter((x) => x !== c))}
                      className="ml-1 rounded-full hover:bg-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">No cities added yet.</p>
            )}
          </div>

          {/* Summary */}
          {suburbs.length === 0 && cities.length === 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              ⚠️ You've selected specific zones but haven't added any suburbs or cities yet. Orders from any suburb will be flagged as outside zone.
            </div>
          )}
        </div>
      )}

      {mode === "ALL" && (
        <p className="text-sm text-slate-500">
          You'll receive orders from any suburb in Australia. You can still decline any individual order.
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          Orders from outside your zones are still accepted — you'll see a warning and can decide to confirm or cancel.
        </p>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#1a2e25] hover:bg-[#2a4e35]">
          {isSaving ? "Saving…" : "Save Zones"}
        </Button>
      </div>
    </div>
  );
}
