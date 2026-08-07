import type { Effect } from "@/lib/types";

const METRIC_LABELS: Record<string, string> = {
  dinero: "Dinero",
  deuda: "Deuda",
  salud: "Salud",
  estres: "Estrés",
  bienestar: "Bienestar",
  capital_social: "Capital social",
  influencia: "Influencia",
};

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
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
    if (amount < 0) return `Deuda ${formatARS(amount)}`;
    const sign = amount > 0 ? "+" : "";
    return `${sign}${formatARS(amount)} Deuda`;
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
        into.push(`${riskPrefix}Credencial: ${effect.value.replaceAll("_", " ")}`);
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
  if (
    hint.startsWith("Cuesta") ||
    hint.includes("Gastás todo") ||
    hint.includes("endeudás") ||
    hint.includes("deuda")
  ) {
    return "money";
  }
  if (hint.startsWith("+") && hint.includes("ARS")) return "good";
  if (hint.includes("% chance") || hint.includes("Fin:")) return "bad";
  if (/^-|\→ 0|baja|Flag: enemigo/.test(hint)) return "bad";
  if (hint.startsWith("+")) return "good";
  if (hint.includes("Desbloquea") || hint.includes("Arregla") || hint.includes("Pagás") || hint.includes("Credencial"))
    return "good";
  return "neutral";
}
