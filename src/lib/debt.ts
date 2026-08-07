import type { PlayerState } from "@/lib/types";

/** Monthly interest rate on outstanding debt. */
export const DEBT_INTEREST_RATE = 0.12;

/** Soft cap where collectors stop being “nice”. */
export const DEBT_TIERS = [
  { min: 1, id: 1, label: "aviso_familiar" },
  { min: 80_000, id: 2, label: "amenazas" },
  { min: 200_000, id: 3, label: "visita" },
  { min: 450_000, id: 4, label: "secuestro" },
  { min: 900_000, id: 5, label: "sangre" },
  { min: 1_800_000, id: 6, label: "infierno" },
  { min: 3_500_000, id: 7, label: "punto_final" },
] as const;

export const DEBT_GAME_OVER = 5_000_000;

export function getDebtTier(deuda: number): number {
  let tier = 0;
  for (const row of DEBT_TIERS) {
    if (deuda >= row.min) tier = row.id;
  }
  return tier;
}

export function applyDebtInterest(state: PlayerState): PlayerState {
  if (state.deuda <= 0) return state;

  const interest = Math.ceil(state.deuda * DEBT_INTEREST_RATE);
  const deuda = state.deuda + interest;
  const stressBump = Math.min(18, 4 + getDebtTier(deuda) * 2);

  return {
    ...state,
    deuda,
    estres: state.estres + stressBump,
    bienestar: state.bienestar - Math.min(12, 2 + getDebtTier(deuda)),
  };
}

export function syncDebtFlags(state: PlayerState): PlayerState {
  let flags = state.flags.filter(
    (f) => !f.startsWith("deuda_tier_") && f !== "en_deuda",
  );

  if (state.deuda > 0) {
    flags = [...flags, "en_deuda", `deuda_tier_${getDebtTier(state.deuda)}`];
  }

  return { ...state, flags };
}

/** Event ids that belong to the collectors escalation track. */
export const COBRANZA_EVENT_IDS = new Set([
  "cobranza_llamadas_familia",
  "cobranza_amenazas",
  "cobranza_visita_casa",
  "cobranza_secuestro_familiar",
  "cobranza_prueba_dolor",
  "cobranza_muleto",
  "cobranza_punto_final",
]);

export function isCobranzaEvent(id: string): boolean {
  return COBRANZA_EVENT_IDS.has(id);
}
