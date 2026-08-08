import politicaData from "@/data/politica-events.json";
import { evaluateConditions } from "@/lib/conditions";
import { getJobById } from "@/lib/jobs";
import type { GameEvent, PlayerState } from "@/lib/types";

export const POLITICA_EVENTS: GameEvent[] = politicaData as GameEvent[];

export function getPoliticaEventById(id: string): GameEvent | undefined {
  return POLITICA_EVENTS.find((e) => e.id === id);
}

function pickWeighted(
  events: GameEvent[],
  random = Math.random,
): GameEvent | null {
  if (events.length === 0) return null;
  const total = events.reduce((s, e) => s + e.peso, 0);
  let roll = random() * total;
  for (const e of events) {
    roll -= e.peso;
    if (roll <= 0) return e;
  }
  return events[events.length - 1] ?? null;
}

export function isPoliticalCareer(state: PlayerState): boolean {
  const job = getJobById(state.trabajo_actual.id);
  if (job?.tags.includes("politico") || job?.tags.includes("territorio")) {
    return true;
  }
  return (
    state.flags.includes("interes_militancia") ||
    state.flags.includes("worked_militante_barrial") ||
    state.influencia >= 25
  );
}

/** Prefer political/militant missions when that life path is active. */
export function pickPoliticaEvent(
  state: PlayerState,
  random = Math.random,
): GameEvent | null {
  if (!isPoliticalCareer(state)) return null;
  const pool = POLITICA_EVENTS.filter(
    (e) =>
      evaluateConditions(state, e.condiciones) &&
      e.id !== state.last_event_id,
  );
  return pickWeighted(pool, random);
}
