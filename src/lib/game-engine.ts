import { evaluateConditions } from "@/lib/conditions";
import {
  getCredentialById,
  hasCredential,
  isStudying,
  meetsCredentialRequirements,
} from "@/lib/credentials";
import {
  applyDebtInterest,
  isCobranzaEvent,
} from "@/lib/debt";
import { tickBodyLimits } from "@/lib/endings";
import { birthdayGiftFor } from "@/lib/identity";
import {
  applyEffects,
  applyMoneySpend,
  checkGameOver,
  clampMetrics,
  normalizePlayerState,
} from "@/lib/effects";
import { EVENTS, getEventById } from "@/lib/events";
import {
  createInitialTrabajo,
  getJobById,
  jobToTrabajoActual,
  meetsJobRequirements,
} from "@/lib/jobs";
import {
  estimateMonthlyCosts,
  listMonthlyCosts,
  resolveMonthlyBills,
} from "@/lib/monthly-costs";
import type { GameEvent, PlayerState } from "@/lib/types";

const MAX_STUDIES = 2;

export function createInitialState(): PlayerState {
  return {
    nombre: "",
    mes_nacimiento: 1,
    edad: 18,
    anio_calendario: 2026,
    mes_calendario: 1,
    perfil_creado: false,
    influencia: 5,
    estado_civil: "soltero",
    hijos: 0,
    dinero: 0,
    deuda: 0,
    salud: 80,
    estres: 20,
    bienestar: 50,
    capital_social: 10,
    trabajo_actual: createInitialTrabajo(),
    mes: 1,
    flags: ["worked_cartonero", "sin_prepaga"],
    credenciales: [],
    estudios_en_curso: [],
    last_event_id: null,
    active_event_id: null,
    game_over: false,
    game_over_reason: null,
    game_over_kind: null,
    meses_estres_al_tope: 0,
    acv_count: 0,
    meses_bienestar_roto: 0,
    month_phase: "idle",
    pending_bills: null,
    pending_month_summary: false,
    last_month_ledger: null,
  };
}

export { normalizePlayerState, estimateMonthlyCosts };

function grantCredential(state: PlayerState, id: string): PlayerState {
  return applyEffects(state, [{ type: "add_credential", value: id }]);
}

function tickStudies(state: PlayerState): {
  state: PlayerState;
  completed: string[];
} {
  if (state.estudios_en_curso.length === 0) {
    return { state, completed: [] };
  }

  let next = { ...state };
  const remaining = [];
  const completed: string[] = [];

  for (const study of next.estudios_en_curso) {
    const left = study.meses_restantes - 1;
    if (left <= 0) {
      completed.push(study.credential_id);
    } else {
      remaining.push({ ...study, meses_restantes: left });
      const cred = getCredentialById(study.credential_id);
      next = {
        ...next,
        estres: next.estres + Math.max(2, Math.round((cred?.estres ?? 6) / 3)),
      };
    }
  }

  next = { ...next, estudios_en_curso: remaining };
  for (const id of completed) {
    next = grantCredential(next, id);
    next = {
      ...next,
      bienestar: next.bienestar + 4,
      capital_social: next.capital_social + 2,
    };
  }

  return { state: next, completed };
}

function isBusy(state: PlayerState): boolean {
  return Boolean(
    state.game_over ||
      state.active_event_id ||
      state.pending_bills ||
      state.pending_month_summary ||
      state.month_phase === "capacitacion" ||
      state.month_phase === "trabajo" ||
      state.month_phase === "cuentas",
  );
}

/** Enroll in a course / degree. Only during the capacitación step. */
export function startCredential(
  state: PlayerState,
  credentialId: string,
): PlayerState {
  if (
    state.game_over ||
    state.active_event_id ||
    state.pending_bills ||
    state.pending_month_summary ||
    state.month_phase !== "capacitacion"
  ) {
    return state;
  }

  const credential = getCredentialById(credentialId);
  if (!credential) return state;
  if (hasCredential(state, credentialId)) return state;
  if (isStudying(state, credentialId)) return state;
  if (!meetsCredentialRequirements(state, credential)) return state;
  if (state.estudios_en_curso.length >= MAX_STUDIES) return state;

  let next = applyMoneySpend(state, credential.costo);
  next = {
    ...next,
    estres: next.estres + credential.estres,
  };

  if (credential.duracion_meses <= 0) {
    next = grantCredential(next, credential.id);
    next = {
      ...next,
      bienestar: next.bienestar + 3,
    };
    return clampMetrics(next);
  }

  next = {
    ...next,
    estudios_en_curso: [
      ...next.estudios_en_curso,
      {
        credential_id: credential.id,
        meses_restantes: credential.duracion_meses,
      },
    ],
  };

  return clampMetrics(next);
}

function applyPassiveEffects(state: PlayerState): PlayerState {
  let next = { ...state };

  if (next.deuda > 0) {
    next = applyDebtInterest(next);
  }

  return clampMetrics(next);
}

export function getEligibleEvents(state: PlayerState): GameEvent[] {
  return EVENTS.filter((event) => {
    if (!evaluateConditions(state, event.condiciones)) return false;
    if (state.last_event_id === event.id) return false;
    return true;
  });
}

export function pickWeightedEvent(
  events: GameEvent[],
  random = Math.random,
): GameEvent | null {
  if (events.length === 0) return null;

  const totalWeight = events.reduce((sum, event) => sum + event.peso, 0);
  let roll = random() * totalWeight;

  for (const event of events) {
    roll -= event.peso;
    if (roll <= 0) return event;
  }

  return events[events.length - 1] ?? null;
}

function pickEventForState(state: PlayerState): GameEvent | null {
  let eligible = getEligibleEvents(state);
  if (eligible.length === 0) {
    eligible = EVENTS.filter((event) =>
      evaluateConditions(state, event.condiciones),
    );
  }

  const cobranza = eligible.filter((e) => isCobranzaEvent(e.id));
  if (cobranza.length > 0 && state.deuda > 0) {
    const forceChance = Math.min(0.92, 0.35 + state.deuda / 2_000_000);
    if (Math.random() < forceChance) {
      return pickWeightedEvent(cobranza);
    }
  }

  return pickWeightedEvent(eligible);
}

export function createProfile(
  state: PlayerState,
  nombre: string,
  mesNacimiento: number,
): PlayerState {
  const clean = nombre.trim().slice(0, 24);
  if (!clean) return state;
  const mes = Math.min(12, Math.max(1, Math.round(mesNacimiento)));
  return clampMetrics({
    ...state,
    nombre: clean,
    mes_nacimiento: mes,
    edad: 18,
    anio_calendario: 2026,
    mes_calendario: mes,
    perfil_creado: true,
  });
}

export function advanceMonth(state: PlayerState): PlayerState {
  if (state.game_over || state.active_event_id || state.pending_month_summary) {
    return state;
  }
  if (!state.perfil_creado) return state;
  if (state.month_phase !== "idle") {
    return state;
  }

  const sueldo = state.trabajo_actual.sueldo;

  let mesCal = state.mes_calendario + 1;
  let anio = state.anio_calendario;
  if (mesCal > 12) {
    mesCal = 1;
    anio += 1;
  }

  let next: PlayerState = {
    ...state,
    dinero: state.dinero + sueldo,
    estres: state.estres + state.trabajo_actual.nivel_estres_mensual,
    mes: state.mes + 1,
    mes_calendario: mesCal,
    anio_calendario: anio,
    month_phase: "capacitacion",
    pending_bills: null,
    last_month_ledger: {
      sueldo,
      lines: [],
      total_gastos: 0,
      total_salteado: 0,
      neto: sueldo,
      historias: [],
      estudios_completados: [],
      interes_deuda: 0,
      pago_deuda: 0,
      balance_historias: 0,
    },
  };

  // Birthday when calendar month hits birth month
  if (mesCal === next.mes_nacimiento) {
    const gift = birthdayGiftFor(next);
    next = {
      ...next,
      edad: next.edad + 1,
      dinero: next.dinero + Math.max(0, gift.dinero),
      salud: next.salud + (gift.deltas.salud ?? 0),
      estres: next.estres + (gift.deltas.estres ?? 0),
      bienestar: next.bienestar + (gift.deltas.bienestar ?? 0),
      capital_social: next.capital_social + (gift.deltas.capital_social ?? 0),
      influencia: next.influencia + (gift.deltas.influencia ?? 0),
      last_month_ledger: {
        ...next.last_month_ledger!,
        historias: [
          {
            bill_id: null,
            titulo: gift.titulo,
            texto: gift.texto,
            dinero: gift.dinero,
            deltas: gift.deltas,
            tono: gift.dinero > 0 || (gift.deltas.bienestar ?? 0) > 0 ? "bueno" : "malo",
          },
        ],
        balance_historias: gift.dinero,
      },
    };
  }

  // Soft influence drift from social capital / politics
  const job = getJobById(next.trabajo_actual.id);
  let influBump = 0;
  if (job?.rama === "politica") influBump += 2;
  if (next.capital_social >= 50) influBump += 1;
  if (influBump) {
    next = { ...next, influencia: next.influencia + influBump };
  }

  return clampMetrics(next);
}

/** Skip or finish capacitación → job step. */
export function continueFromTraining(state: PlayerState): PlayerState {
  if (state.game_over || state.month_phase !== "capacitacion") {
    return state;
  }
  return { ...state, month_phase: "trabajo" };
}

/** Skip or finish job choice → bills step. */
export function continueFromJob(state: PlayerState): PlayerState {
  if (state.game_over || state.month_phase !== "trabajo") {
    return state;
  }
  const bills = listMonthlyCosts(state);
  return {
    ...state,
    month_phase: "cuentas",
    pending_bills: bills,
  };
}

/** After the player chooses pay/skip for each bill, finish the month and show summary. */
export function resolveBills(
  state: PlayerState,
  decisions: Record<string, "pay" | "skip">,
): PlayerState {
  if (
    state.game_over ||
    state.month_phase !== "cuentas" ||
    !state.pending_bills?.length
  ) {
    return state;
  }

  const { state: afterBills, ledger } = resolveMonthlyBills(state, decisions);
  const { state: afterStudies, completed } = tickStudies(afterBills);

  const deudaBefore = afterStudies.deuda;
  let next = applyPassiveEffects(afterStudies);
  const interes = Math.max(0, next.deuda - deudaBefore);

  const enrichedLedger = {
    ...ledger,
    estudios_completados: completed,
    interes_deuda: interes,
    neto:
      ledger.sueldo -
      ledger.total_gastos +
      ledger.balance_historias -
      (ledger.pago_deuda ?? 0),
  };

  next = {
    ...next,
    last_month_ledger: enrichedLedger,
    pending_month_summary: true,
    month_phase: "idle",
  };

  const body = tickBodyLimits(next);
  next = body.state;

  next = clampMetrics(next);
  return checkGameOver(next);
}

/** Close the month résumé and roll the random event. */
export function dismissMonthSummary(state: PlayerState): PlayerState {
  if (!state.pending_month_summary) {
    return state;
  }

  let next: PlayerState = {
    ...state,
    pending_month_summary: false,
  };

  next = checkGameOver(next);
  if (next.game_over) {
    return next;
  }

  const event = pickEventForState(next);
  if (event) {
    next = {
      ...next,
      active_event_id: event.id,
    };
  }

  return checkGameOver(next);
}

export function applyChoice(
  state: PlayerState,
  optionId: string,
): PlayerState {
  if (state.game_over || !state.active_event_id || state.pending_bills || state.pending_month_summary) {
    return state;
  }

  const event = getEventById(state.active_event_id);
  if (!event) {
    return { ...state, active_event_id: null };
  }

  const option = event.opciones.find((item) => item.id === optionId);
  if (!option) {
    return state;
  }

  let next = applyEffects(state, option.efectos);
  next = {
    ...next,
    last_event_id: event.id,
    active_event_id: null,
  };

  return checkGameOver(next);
}

export function changeJob(state: PlayerState, jobId: string): PlayerState {
  if (
    state.game_over ||
    state.active_event_id ||
    state.pending_bills ||
    state.pending_month_summary ||
    state.month_phase !== "trabajo"
  ) {
    return state;
  }

  const job = getJobById(jobId);
  if (!job || !meetsJobRequirements(state, job)) {
    return state;
  }

  const flags = state.flags.includes(`worked_${job.id}`)
    ? state.flags
    : [...state.flags, `worked_${job.id}`];

  return checkGameOver({
    ...state,
    trabajo_actual: jobToTrabajoActual(job),
    flags,
  });
}

export function getActiveEvent(state: PlayerState): GameEvent | null {
  if (!state.active_event_id) return null;
  return getEventById(state.active_event_id) ?? null;
}
