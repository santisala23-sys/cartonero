"use client";

import type { MetricKey } from "@/lib/types";

interface MetricBarProps {
  label: string;
  value: number;
  metric: MetricKey;
  alert?: boolean;
}

function barColor(metric: MetricKey, value: number, alert?: boolean): string {
  if (alert) return "bg-red-600";
  if (metric === "estres") {
    if (value >= 80) return "bg-red-600";
    if (value >= 55) return "bg-amber-500";
    return "bg-stone-500";
  }
  if (metric === "salud") {
    if (value <= 30) return "bg-red-600";
    if (value <= 55) return "bg-amber-500";
    return "bg-emerald-600";
  }
  if (metric === "bienestar") {
    if (value <= 30) return "bg-red-500";
    return "bg-sky-600";
  }
  return "bg-teal-700";
}

export function MetricBar({ label, value, metric, alert }: MetricBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isAlert =
    alert ||
    (metric === "estres" && value >= 80) ||
    (metric === "salud" && value <= 30);

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            isAlert ? "text-red-600" : "text-stone-600"
          }`}
        >
          {label}
        </span>
        <span
          className={`font-mono text-xs tabular-nums ${
            isAlert ? "text-red-700" : "text-stone-800"
          }`}
        >
          {Math.round(clamped)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-sm bg-stone-200/80">
        <div
          className={`h-full rounded-sm transition-[width] duration-500 ease-out ${barColor(metric, clamped, isAlert)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

interface StatusBarProps {
  salud: number;
  estres: number;
  bienestar: number;
  capital_social: number;
}

export function StatusBar({
  salud,
  estres,
  bienestar,
  capital_social,
}: StatusBarProps) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
      <MetricBar label="Salud" value={salud} metric="salud" />
      <MetricBar label="Estrés" value={estres} metric="estres" />
      <MetricBar label="Bienestar" value={bienestar} metric="bienestar" />
      <MetricBar
        label="Capital social"
        value={capital_social}
        metric="capital_social"
      />
    </div>
  );
}
