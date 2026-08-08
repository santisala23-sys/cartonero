import { DEBT_GAME_OVER, syncDebtFlags } from "@/lib/debt";
import { evaluateDefeat, evaluateVictory } from "@/lib/endings";
import { summarizeEffects } from "@/lib/effect-summary";
import { getJobById, jobToTrabajoActual } from "@/lib/jobs";
import type { Effect, MetricKey, PlayerState } from "@/lib/types";

const METRICS: MetricKey[] = [
  "salud",
  "estres",
  "bienestar",
  "capital_social",
  "influencia",
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampMetrics(state: PlayerState): PlayerState {
  const next = {
    ...state,
    dinero: Math.max(0, state.dinero),
    dinero_negro: Math.max(0, state.dinero_negro ?? 0),
    deuda: Math.max(0, Math.round(state.deuda)),
    salud: clamp(state.salud, 0, 100),
    estres: clamp(state.estres, 0, 100),
    bienestar: clamp(state.bienestar, 0, 100),
    capital_social: clamp(state.capital_social, 0, 100),
    influencia: clamp(state.influencia ?? 0, 0, 100),
    edad: Math.max(16, Math.round(state.edad ?? 18)),
    hijos: Math.max(0, Math.round(state.hijos ?? 0)),
    mes_nacimiento: clamp(state.mes_nacimiento || 1, 1, 12),
    mes_calendario: clamp(state.mes_calendario || 1, 1, 12),
    partido: typeof state.partido === "string" ? state.partido : null,
    partido_nombre:
      typeof state.partido_nombre === "string" ? state.partido_nombre : null,
  };
  return syncDebtFlags(next);
}

function addFlag(flags: string[], value: string): string[] {
  if (flags.includes(value)) return flags;
  return [...flags, value];
}

function removeFlag(flags: string[], value: string): string[] {
  return flags.filter((flag) => flag !== value);
}

/** Spend cash; anything you can't cover becomes debt. */
export function applyMoneySpend(state: PlayerState, cost: number): PlayerState {
  const safeCost = Math.max(0, Math.round(cost));
  if (safeCost === 0) return state;

  if (state.dinero >= safeCost) {
    return { ...state, dinero: state.dinero - safeCost };
  }

  const shortfall = safeCost - state.dinero;
  return {
    ...state,
    dinero: 0,
    deuda: state.deuda + shortfall,
  };
}

export function applyMoneyGain(state: PlayerState, amount: number): PlayerState {
  return { ...state, dinero: state.dinero + Math.max(0, Math.round(amount)) };
}

export function payDebt(
  state: PlayerState,
  amount: number | "all",
): PlayerState {
  if (state.deuda <= 0) return state;

  const available = state.dinero;
  const target =
    amount === "all" ? state.deuda : Math.max(0, Math.round(amount));
  const payment = Math.min(available, state.deuda, target);

  return {
    ...state,
    dinero: state.dinero - payment,
    deuda: state.deuda - payment,
  };
}

function addCredential(state: PlayerState, id: string): PlayerState {
  if (state.credenciales.includes(id)) return state;
  let flags = state.flags;
  // Keep legacy flag in sync for curso_n8n
  if (id === "curso_n8n" && !flags.includes("curso_n8n")) {
    flags = [...flags, "curso_n8n"];
  }
  return {
    ...state,
    credenciales: [...state.credenciales, id],
    flags,
    estudios_en_curso: state.estudios_en_curso.filter(
      (e) => e.credential_id !== id,
    ),
  };
}

export function applyEffect(state: PlayerState, effect: Effect): PlayerState {
  switch (effect.type) {
    case "delta": {
      if (effect.metric === "dinero") {
        if (effect.amount <= -999999999) {
          return { ...state, dinero: 0 };
        }
        if (effect.amount < 0) {
          return applyMoneySpend(state, Math.abs(effect.amount));
        }
        return applyMoneyGain(state, effect.amount);
      }
      if (effect.metric === "dinero_negro") {
        if (effect.amount < 0) {
          const cost = Math.abs(effect.amount);
          const negro = state.dinero_negro ?? 0;
          if (negro >= cost) {
            return { ...state, dinero_negro: negro - cost };
          }
          // Si no alcanza el negro, el resto sale del blanco / deuda
          return applyMoneySpend(
            { ...state, dinero_negro: 0 },
            cost - negro,
          );
        }
        return {
          ...state,
          dinero_negro: (state.dinero_negro ?? 0) + Math.max(0, Math.round(effect.amount)),
        };
      }
      if (effect.metric === "deuda") {
        return {
          ...state,
          deuda: Math.max(0, state.deuda + effect.amount),
        };
      }
      return {
        ...state,
        [effect.metric]: state[effect.metric] + effect.amount,
      };
    }
    case "set_metric":
      return { ...state, [effect.metric]: effect.value };
    case "add_flag": {
      let next = { ...state, flags: addFlag(state.flags, effect.value) };
      if (effect.value === "curso_n8n") {
        next = addCredential(next, "curso_n8n");
      }
      return next;
    }
    case "remove_flag":
      return { ...state, flags: removeFlag(state.flags, effect.value) };
    case "add_credential":
      return addCredential(state, effect.value);
    case "set_job": {
      const job = getJobById(effect.job_id);
      if (!job) return state;
      // Respetar edad mínima aunque venga de un evento (carrera creíble).
      if (
        job.requisitos.edad_min !== undefined &&
        state.edad < job.requisitos.edad_min
      ) {
        return state;
      }
      return {
        ...state,
        trabajo_actual: jobToTrabajoActual(job),
        flags: addFlag(state.flags, `worked_${job.id}`),
      };
    }
    case "pay_debt":
      return payDebt(state, effect.amount);
    case "set_estado_civil":
      return { ...state, estado_civil: effect.value };
    case "add_hijo":
      return {
        ...state,
        hijos: state.hijos + Math.max(1, effect.amount ?? 1),
      };
    case "risk": {
      if (Math.random() < effect.chance) {
        return applyEffects(state, effect.effects);
      }
      return state;
    }
    default:
      return state;
  }
}

export type RiskRollResult = {
  chance: number;
  hit: boolean;
  hints: string[];
};

function applyEffectLogged(
  state: PlayerState,
  effect: Effect,
  rolls: RiskRollResult[],
): PlayerState {
  if (effect.type === "risk") {
    const hit = Math.random() < effect.chance;
    rolls.push({
      chance: effect.chance,
      hit,
      hints: summarizeEffects(effect.effects),
    });
    if (hit) {
      return applyEffectsLogged(state, effect.effects, rolls).state;
    }
    return state;
  }
  return applyEffect(state, effect);
}

/** Like applyEffects, but records each risk roll (hit / miss). */
export function applyEffectsLogged(
  state: PlayerState,
  effects: Effect[],
  rolls: RiskRollResult[] = [],
): { state: PlayerState; risks: RiskRollResult[] } {
  let next = state;
  for (const effect of effects) {
    next = applyEffectLogged(next, effect, rolls);
  }
  return { state: clampMetrics(next), risks: rolls };
}

export function applyEffects(
  state: PlayerState,
  effects: Effect[],
): PlayerState {
  let next = state;
  for (const effect of effects) {
    next = applyEffect(next, effect);
  }
  return clampMetrics(next);
}

export function checkGameOver(state: PlayerState): PlayerState {
  if (state.game_over) return state;

  const victory = evaluateVictory(state);
  if (victory) {
    return {
      ...state,
      game_over: true,
      game_over_kind: victory.kind,
      game_over_reason: victory.reason,
      active_event_id: null,
      pending_bills: null,
      pending_month_summary: false,
    };
  }

  const defeatExtra = evaluateDefeat(state);
  if (defeatExtra) {
    return {
      ...state,
      game_over: true,
      game_over_kind: defeatExtra.kind,
      game_over_reason: defeatExtra.reason,
      active_event_id: null,
      pending_bills: null,
      // Keep month summary so the player sees the ACV beat first.
    };
  }

  if (state.salud <= 0) {
    return {
      ...state,
      salud: 0,
      game_over: true,
      game_over_kind: "derrota",
      game_over_reason: "Tu salud llegó a cero. El cuerpo no aguanta más.",
      active_event_id: null,
    };
  }

  if (state.deuda >= DEBT_GAME_OVER) {
    return {
      ...state,
      game_over: true,
      game_over_kind: "derrota",
      game_over_reason:
        "La deuda te comió vivo. Los cobradores ya no negocian: tu familia desapareció del mapa y vos quedaste como advertencia. Fin del camino.",
      active_event_id: null,
    };
  }

  if (state.flags.includes("cobranza_fin")) {
    return {
      ...state,
      game_over: true,
      game_over_kind: "derrota",
      game_over_reason:
        "Cruzaste la línea. Ahora laburás para ellos, sin nombre, sin salida. Cartonero terminó: empezó otra cosa peor.",
      active_event_id: null,
    };
  }

  return state;
}

export function isMetric(key: string): key is MetricKey {
  return METRICS.includes(key as MetricKey);
}

export function normalizePlayerState(
  raw: Partial<PlayerState> | null | undefined,
): PlayerState | null {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.trabajo_actual) return null;

  return clampMetrics({
    nombre: typeof raw.nombre === "string" ? raw.nombre : "",
    genero: raw.genero === "mujer" ? "mujer" : "hombre",
    mes_nacimiento: Number(raw.mes_nacimiento) || 1,
    edad: Number(raw.edad) || 18,
    anio_calendario: Number(raw.anio_calendario) || 2026,
    mes_calendario: Number(raw.mes_calendario) || 1,
    perfil_creado: Boolean(raw.perfil_creado),
    influencia: Number(raw.influencia) || 0,
    estado_civil:
      raw.estado_civil === "en_pareja" ||
      raw.estado_civil === "casado" ||
      raw.estado_civil === "gatero"
        ? raw.estado_civil
        : "soltero",
    hijos: Number(raw.hijos) || 0,
    vivienda:
      raw.vivienda === "pieza" ||
      raw.vivienda === "alquiler" ||
      raw.vivienda === "barrio_cerrado"
        ? raw.vivienda
        : "villa",
    meses_luz_colgada: Number(raw.meses_luz_colgada) || 0,
    dinero: Number(raw.dinero) || 0,
    dinero_negro: Number(raw.dinero_negro) || 0,
    deuda: Number(raw.deuda) || 0,
    salud: Number(raw.salud) || 0,
    estres: Number(raw.estres) || 0,
    bienestar: Number(raw.bienestar) || 0,
    capital_social: Number(raw.capital_social) || 0,
    partido: typeof raw.partido === "string" ? raw.partido : null,
    partido_nombre:
      typeof raw.partido_nombre === "string" ? raw.partido_nombre : null,
    partido_afinidades: normalizeAfinidades(raw.partido_afinidades),
    mes_internas_fail:
      raw.mes_internas_fail == null ? null : Number(raw.mes_internas_fail) || null,
    mes_ballotage_fail:
      raw.mes_ballotage_fail == null
        ? null
        : Number(raw.mes_ballotage_fail) || null,
    trabajo_actual: raw.trabajo_actual,
    month_start_snapshot: raw.month_start_snapshot ?? null,
    mes: Number(raw.mes) || 1,
    flags: Array.isArray(raw.flags) ? raw.flags : [],
    credenciales: Array.isArray(raw.credenciales)
      ? raw.credenciales
      : raw.flags?.includes("curso_n8n")
        ? ["curso_n8n"]
        : [],
    estudios_en_curso: Array.isArray(raw.estudios_en_curso)
      ? raw.estudios_en_curso
      : [],
    last_event_id: raw.last_event_id ?? null,
    active_event_id: raw.active_event_id ?? null,
    game_over: Boolean(raw.game_over),
    game_over_reason: raw.game_over_reason ?? null,
    game_over_kind:
      raw.game_over_kind === "victoria" || raw.game_over_kind === "derrota"
        ? raw.game_over_kind
        : raw.game_over
          ? "derrota"
          : null,
    meses_estres_al_tope: Number(raw.meses_estres_al_tope) || 0,
    acv_count: Number(raw.acv_count) || 0,
    meses_bienestar_roto: Number(raw.meses_bienestar_roto) || 0,
    month_phase: normalizeMonthPhase(raw),
    actualidad_seen_ids: Array.isArray(raw.actualidad_seen_ids)
      ? raw.actualidad_seen_ids.filter((id): id is string => typeof id === "string")
      : [],
    last_month_ledger: raw.last_month_ledger ?? null,
    pending_bills: raw.pending_bills ?? null,
    pending_month_summary: Boolean(raw.pending_month_summary),
    pending_risk_reveal: raw.pending_risk_reveal ?? null,
  });
}

function normalizeAfinidades(
  raw: PlayerState["partido_afinidades"] | unknown,
): PlayerState["partido_afinidades"] {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    pj: Number(o.pj) || 0,
    ucr: Number(o.ucr) || 0,
    lla: Number(o.lla) || 0,
    pro: Number(o.pro) || 0,
    izquierda: Number(o.izquierda) || 0,
  };
}

function normalizeMonthPhase(
  raw: Partial<PlayerState>,
): PlayerState["month_phase"] {
  const phase = raw.month_phase;
  if (
    phase === "idle" ||
    phase === "capacitacion" ||
    phase === "trabajo" ||
    phase === "cuentas" ||
    phase === "brujula" ||
    phase === "partido" ||
    phase === "internas" ||
    phase === "ballotage"
  ) {
    return phase;
  }
  // Migrate old saves mid-bills
  if (raw.pending_bills?.length) return "cuentas";
  if (raw.pending_month_summary) return "idle";
  if (raw.active_event_id) return "idle";
  return "idle";
}
