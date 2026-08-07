import type { PlayerState } from "@/lib/types";

/** Consecutive months at max stress before a stroke. */
export const STRESS_STREAK_FOR_ACV = 6;
/** Strokes before death. */
export const ACV_FATAL_COUNT = 4;

export type EndingKind = "victoria" | "derrota";

export interface EndingResult {
  kind: EndingKind;
  reason: string;
}

function hasJob(state: PlayerState, ids: string[]): boolean {
  return ids.includes(state.trabajo_actual.id);
}

function spendCash(state: PlayerState, cost: number): PlayerState {
  const safe = Math.max(0, Math.round(cost));
  if (safe === 0) return state;
  if (state.dinero >= safe) {
    return { ...state, dinero: state.dinero - safe };
  }
  return {
    ...state,
    dinero: 0,
    deuda: state.deuda + (safe - state.dinero),
  };
}

/** Positive closures — climbing out or lasting. */
export function evaluateVictory(state: PlayerState): EndingResult | null {
  if (hasJob(state, ["presidente"])) {
    return {
      kind: "victoria",
      reason:
        "Llegaste a Presidente. Desde el cartonero hasta la Rosada: la ciudad ya no te come, la gobernás. Fin — victoria.",
    };
  }

  if (hasJob(state, ["gobernador"])) {
    return {
      kind: "victoria",
      reason:
        "Sos Gobernador. El barrio que te vio con el carrito ahora te ve en el peaje de la provincia. Fin — victoria.",
    };
  }

  if (
    state.dinero >= 2_500_000 &&
    state.deuda <= 0 &&
    state.bienestar >= 55 &&
    state.salud >= 50
  ) {
    return {
      kind: "victoria",
      reason:
        "Juntaste plata, saldiste la deuda y te queda cuerpo. Te mudás lejos del quilombo. Cartonero termina: empezó otra vida.",
    };
  }

  if (
    state.mes >= 48 &&
    state.deuda <= 0 &&
    state.estres < 55 &&
    state.salud >= 45 &&
    state.bienestar >= 40
  ) {
    return {
      kind: "victoria",
      reason:
        "Cuatro años bancándola sin quebrarte del todo. No sos millonario, pero seguís en pie. Eso también es ganar.",
    };
  }

  if (
    hasJob(state, ["intendente", "gerente_general", "director_agencia"]) &&
    state.capital_social >= 70 &&
    state.deuda <= 50_000 &&
    state.mes >= 24
  ) {
    return {
      kind: "victoria",
      reason:
        "Construiste poder, contactos y un laburo que te sostiene. El juego cierra: ya no sos el de abajo.",
    };
  }

  return null;
}

/** Fatal / collapse endings beyond basic salud/deuda checks. */
export function evaluateDefeat(state: PlayerState): EndingResult | null {
  if (state.acv_count >= ACV_FATAL_COUNT) {
    return {
      kind: "derrota",
      reason:
        "El cuarto ACV. El cuerpo dijo basta en el hospital. Cuatro bobazos y se apagó la luz. Fin del camino.",
    };
  }

  if (state.bienestar <= 0 && state.meses_bienestar_roto >= 6) {
    return {
      kind: "derrota",
      reason:
        "Seis meses sin un gramo de bienestar. Dejaste de pelear. La ciudad sigue; vos no. Fin del camino.",
    };
  }

  return null;
}

/**
 * Track stress streak / bienestar collapse; fire ACV hospital week when due.
 */
export function tickBodyLimits(state: PlayerState): {
  state: PlayerState;
  acvTriggered: boolean;
} {
  let next = { ...state };
  let acvTriggered = false;

  if (next.estres >= 100) {
    next = {
      ...next,
      meses_estres_al_tope: (next.meses_estres_al_tope ?? 0) + 1,
    };
  } else {
    next = { ...next, meses_estres_al_tope: 0 };
  }

  if (next.bienestar <= 0) {
    next = {
      ...next,
      meses_bienestar_roto: (next.meses_bienestar_roto ?? 0) + 1,
    };
  } else {
    next = { ...next, meses_bienestar_roto: 0 };
  }

  if ((next.meses_estres_al_tope ?? 0) >= STRESS_STREAK_FOR_ACV) {
    acvTriggered = true;
    const acvCount = (next.acv_count ?? 0) + 1;
    const hospitalBill = Math.max(
      60000,
      Math.round(next.trabajo_actual.sueldo * 0.6),
    );

    next = spendCash(next, hospitalBill);
    next = {
      ...next,
      acv_count: acvCount,
      meses_estres_al_tope: 0,
      salud: Math.max(5, next.salud - 35),
      estres: 35,
      bienestar: Math.max(0, next.bienestar - 18),
      capital_social: Math.max(0, next.capital_social - 8),
      flags: next.flags.includes("sobrevivio_acv")
        ? next.flags
        : [...next.flags, "sobrevivio_acv"],
    };

    const ledger = next.last_month_ledger;
    if (ledger) {
      const texto =
        acvCount >= ACV_FATAL_COUNT
          ? `Llevabas ${STRESS_STREAK_FOR_ACV} meses al borde. Te agarró el bobazo número ${acvCount}. Esta vez no volvés.`
          : `Llevabas ${STRESS_STREAK_FOR_ACV} meses con el estrés al mango. Te agarró un ACV (bobazo #${acvCount}/${ACV_FATAL_COUNT}). Una semana en el hospital: cuenta de $${hospitalBill.toLocaleString("es-AR")}, el cuerpo hecho mierda, y un aviso claro.`;

      next = {
        ...next,
        last_month_ledger: {
          ...ledger,
          historias: [
            ...(ledger.historias ?? []),
            {
              bill_id: null,
              titulo:
                acvCount >= ACV_FATAL_COUNT
                  ? "El último bobazo"
                  : "ACV — una semana en el hospital",
              texto,
              dinero: -hospitalBill,
              deltas: {
                salud: -35,
                bienestar: -18,
                capital_social: -8,
              },
              tono: "malo",
            },
          ],
          balance_historias: (ledger.balance_historias ?? 0) - hospitalBill,
        },
      };
    }
  }

  return { state: next, acvTriggered };
}
