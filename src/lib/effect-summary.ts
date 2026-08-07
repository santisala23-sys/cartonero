import type { Effect, MetricKey } from "@/lib/types";

const METRIC_LABELS: Record<string, string> = {
  dinero: "Dinero",
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
        if (effect.value === "curso_n8n") {
          into.push(`${riskPrefix}Desbloquea jobs tech`);
        } else if (effect.value === "canos_rotos") {
          into.push(`${riskPrefix}Caños rotos (bienestar baja cada mes)`);
        } else if (effect.value === "cobranza_fin") {
          into.push(`${riskPrefix}Fin: quedás en sus manos`);
        } else if (effect.value.startsWith("worked_")) {
          // skip
        } else {
          into.push(`${riskPrefix}Flag: ${effect.value.replaceAll("_", " ")}`);
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
        const pct = Math.round(effect.chance * 100);
        collectHints(effect.effects, into, `${pct}% chance: `, cashOnHand);
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

export function hintTone(hint: string): "good" | "bad" | "neutral" | "money" {
  const h = hint.toLowerCase();
  const trimmed = hint.trimStart();
  const hasMinus =
    trimmed.startsWith("−") ||
    trimmed.startsWith("-") ||
    /[−-]\d/.test(hint);
  const hasPlus = /\+\d/.test(hint) || trimmed.startsWith("+");

  if (
    h.startsWith("cuesta") ||
    h.includes("gastás todo") ||
    h.includes("endeudás")
  ) {
    return "money";
  }

  // Estrés: bajar es bueno (también con prefijo de chance)
  if (h.includes("estrés") || h.includes("estres")) {
    if (hasMinus) return "good";
    if (hasPlus) return "bad";
  }

  // Deuda: bajar / pagar es bueno
  if (h.includes("deuda")) {
    if (hasMinus || h.includes("pagás")) return "good";
    if (hasPlus) return "bad";
  }

  if (hint.startsWith("+") && hint.includes("ARS")) return "good";
  if (h.includes("% chance") || h.includes("fin:")) return "bad";
  if (trimmed.startsWith("+")) return "good";
  if (trimmed.startsWith("−") || trimmed.startsWith("-")) return "bad";
  if (
    h.includes("desbloquea") ||
    h.includes("arregla") ||
    h.includes("credencial") ||
    h.includes("sin cambios")
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
