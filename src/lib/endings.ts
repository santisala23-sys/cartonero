import type { PlayerState } from "@/lib/types";

/** Trimestres seguidos al tope de estrés antes de un ACV. */
export const STRESS_STREAK_FOR_ACV = 4;
/** ACVs antes de morir. */
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

/** Solo se gana llegando a Presidente. */
export function evaluateVictory(state: PlayerState): EndingResult | null {
  if (!hasJob(state, ["presidente"])) return null;

  if (state.flags.includes("victoria_manchada")) {
    return {
      kind: "victoria",
      reason:
        "Llegaste a Presidente con el escrutinio oloroso a quilombo. La Rosada es tuya; la historia va a discutir cómo. Desde el carrito hasta la banda: victoria manchada, pero victoria.",
    };
  }
  if (
    state.flags.includes("debate_origen") ||
    state.flags.includes("relato_origen")
  ) {
    return {
      kind: "victoria",
      reason:
        "Presidente. El país vio de dónde saliste y te compró el relato. Cartonero, militante, Rosada. Fin — victoria.",
    };
  }
  if (state.flags.includes("ballotage_ganado")) {
    return {
      kind: "victoria",
      reason:
        "Ballotage en vivo, internas bancadas y la banda presidencial. Del changuito a la Rosada: victoria.",
    };
  }
  return {
    kind: "victoria",
    reason:
      "Llegaste a Presidente. Desde el cartonero hasta la Rosada: la ciudad ya no te come, la gobernás. Fin — victoria.",
  };
}

/** Derrotas fatales / colapso (además de salud/deuda en checkGameOver). */
export function evaluateDefeat(state: PlayerState): EndingResult | null {
  if (state.flags.includes("fuga_exterior")) {
    return {
      kind: "derrota",
      reason:
        "Te fuiste del país 'a dar una conferencia'. Los titulares te alcanzaron igual. Fin del camino: prófugo con valija.",
    };
  }

  if (state.flags.includes("juicio_politico_perdido")) {
    return {
      kind: "derrota",
      reason:
        "El juicio político te destituyó. Los que aplaudían ayer hoy miran para otro lado. Fin del camino político.",
    };
  }

  if (state.flags.includes("renuncia_forzada")) {
    return {
      kind: "derrota",
      reason:
        "Renunciaste bajo fuego. Salvaste el cuerpo, no el relato. La política te escupió y seguiste vivo: derrota parcial, pero derrota.",
    };
  }

  if (state.acv_count >= ACV_FATAL_COUNT) {
    return {
      kind: "derrota",
      reason:
        "El cuarto ACV. El cuerpo dijo basta en el hospital. Cuatro bobazos y se apagó la luz. Fin del camino.",
    };
  }

  if (state.bienestar <= 0 && state.meses_bienestar_roto >= 4) {
    return {
      kind: "derrota",
      reason:
        "Cuatro trimestres sin un gramo de bienestar. Dejaste de pelear. La ciudad sigue; vos no. Fin del camino.",
    };
  }

  return null;
}

/**
 * Track stress streak / bienestar collapse; fire ACV when due.
 * Contadores avanzan 1 por turno (= 1 trimestre).
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
          ? `Llevabas ${STRESS_STREAK_FOR_ACV} trimestres al borde. Te agarró el bobazo número ${acvCount}. Esta vez no volvés.`
          : `Llevabas ${STRESS_STREAK_FOR_ACV} trimestres con el estrés al mango. Te agarró un ACV (bobazo #${acvCount}/${ACV_FATAL_COUNT}). Una semana en el hospital: cuenta de $${hospitalBill.toLocaleString("es-AR")}, el cuerpo hecho mierda, y un aviso claro.`;

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
