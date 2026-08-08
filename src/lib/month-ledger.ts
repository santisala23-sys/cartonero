import type { ChoiceEcho, Effect, MonthSnapshot, PlayerState } from "@/lib/types";
import { summarizeEffects } from "@/lib/effect-summary";

export function takeMonthSnapshot(state: PlayerState): MonthSnapshot {
  return {
    dinero: state.dinero,
    dinero_negro: state.dinero_negro ?? 0,
    deuda: state.deuda,
    salud: state.salud,
    estres: state.estres,
    bienestar: state.bienestar,
    capital_social: state.capital_social,
    influencia: state.influencia,
  };
}

export function cashTotal(state: Pick<PlayerState, "dinero" | "dinero_negro">): number {
  return Math.max(0, state.dinero) + Math.max(0, state.dinero_negro ?? 0);
}

/** Política: plata que entra por el evento va en negro (coimas / sobres). */
export function routePoliticaCashToNegro(effects: Effect[]): Effect[] {
  return effects.map((effect) => {
    if (effect.type === "delta" && effect.metric === "dinero" && effect.amount > 0) {
      return { ...effect, metric: "dinero_negro" as const };
    }
    if (effect.type === "risk") {
      return { ...effect, effects: routePoliticaCashToNegro(effect.effects) };
    }
    return effect;
  });
}

function inferEcoTone(effects: Effect[]): ChoiceEcho["tono"] {
  let score = 0;
  for (const effect of effects) {
    if (effect.type === "delta") {
      if (effect.metric === "estres" || effect.metric === "deuda") {
        score += effect.amount < 0 ? 1 : -1;
      } else if (
        effect.metric === "dinero" ||
        effect.metric === "dinero_negro" ||
        effect.metric === "influencia" ||
        effect.metric === "capital_social" ||
        effect.metric === "salud" ||
        effect.metric === "bienestar"
      ) {
        score += effect.amount > 0 ? 1 : effect.amount < 0 ? -1 : 0;
      }
    } else if (effect.type === "risk") {
      score -= 1;
    } else if (effect.type === "add_flag" && /coima|tranza|causa|preso/.test(effect.value)) {
      score -= 1;
    }
  }
  if (score > 0) return "bueno";
  if (score < 0) return "malo";
  return "neutro";
}

export function buildChoiceEcho(
  eventTitulo: string,
  option: { label: string; eco?: string; efectos: Effect[] },
): ChoiceEcho {
  const hints = summarizeEffects(option.efectos).slice(0, 2).join(" · ");
  const texto =
    option.eco?.trim() ||
    (hints && hints !== "Sin cambios"
      ? `${option.label}. ${hints}.`
      : option.label);

  return {
    event_titulo: eventTitulo,
    opcion_label: option.label,
    texto,
    tono: inferEcoTone(option.efectos),
  };
}

export function computeMetricDeltas(
  snap: MonthSnapshot,
  state: PlayerState,
): NonNullable<NonNullable<PlayerState["last_month_ledger"]>["metric_deltas"]> {
  return {
    dinero: Math.round(state.dinero - snap.dinero),
    dinero_negro: Math.round((state.dinero_negro ?? 0) - snap.dinero_negro),
    deuda: Math.round(state.deuda - snap.deuda),
    salud: Math.round(state.salud - snap.salud),
    estres: Math.round(state.estres - snap.estres),
    bienestar: Math.round(state.bienestar - snap.bienestar),
    capital_social: Math.round(state.capital_social - snap.capital_social),
    influencia: Math.round(state.influencia - snap.influencia),
  };
}

export function enrichLedgerAfterChoice(
  state: PlayerState,
  beforeCash: number,
  echo: ChoiceEcho,
): PlayerState {
  const ledger = state.last_month_ledger;
  if (!ledger) return state;

  const afterCash = cashTotal(state);
  const cashDelta = afterCash - beforeCash;
  const ganado = (ledger.dinero_ganado ?? ledger.sueldo) + Math.max(0, cashDelta);
  const perdido =
    (ledger.dinero_perdido ?? ledger.total_gastos + (ledger.pago_deuda ?? 0)) +
    Math.max(0, -cashDelta);
  const snap = state.month_start_snapshot;
  const metric_deltas = snap ? computeMetricDeltas(snap, state) : ledger.metric_deltas;

  return {
    ...state,
    last_month_ledger: {
      ...ledger,
      choice_ecos: [...(ledger.choice_ecos ?? []), echo],
      dinero_ganado: ganado,
      dinero_perdido: perdido,
      margen: ganado - perdido,
      metric_deltas,
    },
  };
}

export function enrichLedgerWithoutChoice(state: PlayerState): PlayerState {
  const ledger = state.last_month_ledger;
  if (!ledger) return state;
  const snap = state.month_start_snapshot;
  const balanceHistorias = ledger.balance_historias ?? 0;
  const ganado =
    ledger.dinero_ganado ?? ledger.sueldo + Math.max(0, balanceHistorias);
  const perdido =
    ledger.dinero_perdido ??
    ledger.total_gastos +
      (ledger.pago_deuda ?? 0) +
      Math.max(0, -balanceHistorias);

  return {
    ...state,
    last_month_ledger: {
      ...ledger,
      dinero_ganado: ganado,
      dinero_perdido: perdido,
      margen: ganado - perdido,
      metric_deltas: snap ? computeMetricDeltas(snap, state) : undefined,
      choice_ecos: ledger.choice_ecos ?? [],
    },
  };
}
