import type { Effect, MetricKey } from "@/lib/types";

const METRIC_LABELS: Record<string, string> = {
  dinero: "Dinero",
  dinero_negro: "En negro",
  deuda: "Deuda",
  salud: "Salud",
  estres: "Estrés",
  bienestar: "Bienestar",
  capital_social: "Capital social",
  influencia: "Influencia",
};

/** Metrics where going down is good for the player. */
const LOWER_IS_GOOD = new Set(["estres", "deuda"]);

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

export function metricDeltaTone(
  metric: string,
  amount: number,
): "good" | "bad" | "neutral" | "money" {
  if (metric === "dinero") {
    if (amount < 0) return "money";
    if (amount > 0) return "good";
    return "neutral";
  }
  if (metric === "dinero_negro") {
    if (amount > 0) return "money";
    if (amount < 0) return "good";
    return "neutral";
  }
  if (amount === 0) return "neutral";
  if (LOWER_IS_GOOD.has(metric)) {
    return amount < 0 ? "good" : "bad";
  }
  return amount > 0 ? "good" : "bad";
}

function formatDelta(
  metric: string,
  amount: number,
  cashOnHand?: number,
): string {
  const label = METRIC_LABELS[metric] ?? metric;
  if (metric === "dinero") {
    if (amount <= -999999999) return "Gastás todo tu dinero";
    if (amount < 0) {
      const cost = Math.abs(amount);
      if (cashOnHand !== undefined && cashOnHand < cost) {
        const shortfall = cost - cashOnHand;
        return `Cuesta ${formatARS(cost)} (te endeudás ${formatARS(shortfall)})`;
      }
      return `Cuesta ${formatARS(amount)}`;
    }
    if (amount > 0) return `+${formatARS(amount)}`;
    return "Dinero sin cambio";
  }
  if (metric === "dinero_negro") {
    if (amount > 0) return `+${formatARS(amount)} en negro`;
    if (amount < 0) return `−${formatARS(amount)} en negro`;
    return "Negro sin cambio";
  }
  if (metric === "deuda") {
    if (amount < 0) return `−${formatARS(amount)} deuda`;
    const sign = amount > 0 ? "+" : "";
    return `${sign}${formatARS(amount)} deuda`;
  }
  if (metric === "estres") {
    if (amount < 0) return `−${Math.abs(amount)} estrés`;
    return `+${amount} estrés`;
  }
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount} ${label}`;
}

function collectHints(
  effects: Effect[],
  into: string[],
  riskPrefix = "",
  cashOnHand?: number,
): void {
  for (const effect of effects) {
    switch (effect.type) {
      case "delta":
        into.push(
          `${riskPrefix}${formatDelta(effect.metric, effect.amount, cashOnHand)}`,
        );
        break;
      case "set_metric": {
        const label = METRIC_LABELS[effect.metric] ?? effect.metric;
        into.push(`${riskPrefix}${label} → ${effect.value}`);
        break;
      }
      case "add_credential":
        into.push(
          `${riskPrefix}Credencial: ${effect.value.replaceAll("_", " ")}`,
        );
        break;
      case "add_flag":
        // No mostrar flags crudos en chips. Solo consecuencias legibles.
        if (effect.value === "curso_n8n") {
          into.push(`${riskPrefix}Desbloquea jobs tech`);
        } else if (effect.value === "canos_rotos") {
          into.push(`${riskPrefix}Caños rotos (bienestar baja cada mes)`);
        } else if (effect.value === "cobranza_fin") {
          into.push(`${riskPrefix}Fin: quedás en sus manos`);
        }
        break;
      case "remove_flag":
        if (effect.value === "canos_rotos") {
          into.push(`${riskPrefix}Arregla los caños`);
        }
        break;
      case "set_job":
        into.push(`${riskPrefix}Cambia de trabajo`);
        break;
      case "pay_debt":
        into.push(
          effect.amount === "all"
            ? `${riskPrefix}Pagás toda la deuda posible`
            : `${riskPrefix}Pagás ${formatARS(effect.amount)} de deuda`,
        );
        break;
      case "set_estado_civil":
        into.push(`${riskPrefix}Estado: ${effect.value.replaceAll("_", " ")}`);
        break;
      case "add_hijo":
        into.push(`${riskPrefix}+${effect.amount ?? 1} hijo/a`);
        break;
      case "risk": {
        // Legacy flat list: keep for callers that only use summarizeEffects
        const pct = Math.round(effect.chance * 100);
        collectHints(effect.effects, into, `${pct}%: `, cashOnHand);
        break;
      }
      default:
        break;
    }
  }
}

/** Human-readable effect chips for option buttons. */
export function summarizeEffects(
  effects: Effect[],
  cashOnHand?: number,
): string[] {
  if (effects.length === 0) return ["Sin cambios"];
  const hints: string[] = [];
  collectHints(effects, hints, "", cashOnHand);
  return hints.length > 0 ? hints : ["Sin cambios"];
}

export type EffectBranch = {
  /** Guaranteed chips (no RNG). */
  guaranteed: string[];
  /** Risk branches with explicit %. */
  risks: { chance: number; hints: string[] }[];
};

/** Separates sure effects from chance branches (El Ídolo style). */
export function summarizeOptionBranches(
  effects: Effect[],
  cashOnHand?: number,
): EffectBranch {
  const guaranteed: string[] = [];
  const risks: { chance: number; hints: string[] }[] = [];

  for (const effect of effects) {
    if (effect.type === "risk") {
      const nested: string[] = [];
      collectHints(effect.effects, nested, "", cashOnHand);
      risks.push({
        chance: effect.chance,
        hints: nested.length > 0 ? nested : ["Sin cambios"],
      });
    } else {
      collectHints([effect], guaranteed, "", cashOnHand);
    }
  }

  if (guaranteed.length === 0 && risks.length === 0) {
    return { guaranteed: ["Sin cambios"], risks: [] };
  }
  return { guaranteed, risks };
}

export function hintTone(hint: string): "good" | "bad" | "neutral" | "money" {
  const h = hint.toLowerCase();
  const trimmed = hint.trimStart();
  // Strip leading "65%: " for tone
  const core = trimmed.replace(/^\d+%\s*:\s*/, "");
  const coreLower = core.toLowerCase();
  const hasMinus =
    core.startsWith("−") ||
    core.startsWith("-") ||
    /[−-]\d/.test(core);
  const hasPlus = /\+\d/.test(core) || core.startsWith("+");

  if (
    coreLower.startsWith("cuesta") ||
    coreLower.includes("gastás todo") ||
    coreLower.includes("endeudás")
  ) {
    return "money";
  }

  if (coreLower.includes("estrés") || coreLower.includes("estres")) {
    if (hasMinus) return "good";
    if (hasPlus) return "bad";
  }

  if (coreLower.includes("deuda")) {
    if (hasMinus || coreLower.includes("pagás")) return "good";
    if (hasPlus) return "bad";
  }

  if (core.startsWith("+") && core.includes("ARS")) return "good";
  if (coreLower.includes("fin:")) return "bad";
  if (core.startsWith("+")) return "good";
  if (core.startsWith("−") || core.startsWith("-")) return "bad";
  if (
    coreLower.includes("desbloquea") ||
    coreLower.includes("arregla") ||
    coreLower.includes("credencial") ||
    coreLower.includes("sin cambios") ||
    coreLower.includes("cambia de trabajo")
  ) {
    return "good";
  }
  return "neutral";
}

export function toneClass(tone: ReturnType<typeof hintTone>): string {
  switch (tone) {
    case "good":
      return "bg-emerald-500/15 text-emerald-300";
    case "bad":
      return "bg-rose-500/15 text-rose-300";
    case "money":
      return "bg-amber-500/15 text-amber-200";
    default:
      return "bg-white/10 text-[#9aabbc]";
  }
}

/** Light surfaces (event card, bills, summary). */
export function toneClassLight(tone: ReturnType<typeof hintTone>): string {
  switch (tone) {
    case "good":
      return "bg-emerald-100/90 text-emerald-900";
    case "bad":
      return "bg-red-100/90 text-red-900";
    case "money":
      return "bg-amber-100/90 text-amber-950";
    default:
      return "bg-stone-200/80 text-stone-700";
  }
}

export function metricChipClass(metric: MetricKey | string, amount: number): string {
  return toneClass(metricDeltaTone(metric, amount));
}
