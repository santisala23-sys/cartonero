import type { PlayerState, Vivienda } from "@/lib/types";

export const VIVIENDA_LABEL: Record<Vivienda, string> = {
  villa: "Villa",
  pieza: "Pieza",
  alquiler: "Alquiler",
  barrio_cerrado: "Barrio cerrado",
};

/** Derive housing from job / studies / influence. */
export function resolveVivienda(state: PlayerState): Vivienda {
  const sueldo = state.trabajo_actual.sueldo;
  const id = state.trabajo_actual.id;
  const hasSec = state.credenciales.includes("secundaria");
  const cartoneroish =
    id === "cartonero" ||
    id === "reciclador_cooperativa" ||
    id === "vendedor_ambulante";

  if (state.influencia >= 70 || sueldo >= 900000) return "barrio_cerrado";
  if (sueldo >= 120000 || (hasSec && sueldo >= 90000)) return "alquiler";
  if (!cartoneroish && sueldo >= 70000) return "pieza";
  return "villa";
}

function withFlag(flags: string[], value: string): string[] {
  return flags.includes(value) ? flags : [...flags, value];
}

function withoutFlag(flags: string[], value: string): string[] {
  return flags.filter((f) => f !== value);
}

function applyViviendaFlags(flags: string[], vivienda: Vivienda): string[] {
  let next = [...flags];
  next = withoutFlag(next, "vivienda_villa");
  next = withoutFlag(next, "vivienda_pieza");
  next = withoutFlag(next, "vivienda_alquiler");
  next = withoutFlag(next, "vivienda_barrio_cerrado");
  next = withFlag(next, `vivienda_${vivienda}`);
  if (vivienda === "villa") {
    next = withFlag(next, "luz_colgada");
  } else {
    next = withoutFlag(next, "luz_colgada");
    next = withoutFlag(next, "corte_muni_luz");
  }
  return next;
}

/** Update vivienda when job/status changes (does not tick stolen-power months). */
export function syncVivienda(state: PlayerState): PlayerState {
  const next = resolveVivienda(state);
  if (state.vivienda === next) {
    return {
      ...state,
      flags: applyViviendaFlags(state.flags, next),
    };
  }

  return {
    ...state,
    vivienda: next,
    meses_luz_colgada: next === "villa" ? state.meses_luz_colgada || 0 : 0,
    flags: applyViviendaFlags(state.flags, next),
  };
}

/** Call once per advanced month while living in the villa. */
export function tickViviendaMonth(state: PlayerState): PlayerState {
  const synced = syncVivienda(state);
  if (synced.vivienda !== "villa") {
    return {
      ...synced,
      meses_luz_colgada: 0,
      flags: withoutFlag(synced.flags, "riesgo_corte_luz"),
    };
  }
  const meses = (synced.meses_luz_colgada ?? 0) + 1;
  let flags = withFlag(synced.flags, "luz_colgada");
  if (meses >= 3 && !flags.includes("corte_muni_luz")) {
    flags = withFlag(flags, "riesgo_corte_luz");
  }
  return {
    ...synced,
    meses_luz_colgada: meses,
    flags,
  };
}
