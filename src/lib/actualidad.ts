import actualidadData from "@/data/actualidad-events.json";
import { evaluateConditions } from "@/lib/conditions";
import type { GameEvent, PlayerState } from "@/lib/types";

export const ACTUALIDAD_EVENTS: GameEvent[] = actualidadData as GameEvent[];

export function isActualidadMonth(mes: number): boolean {
  return mes >= 3 && mes % 3 === 0;
}

export function getActualidadEventById(id: string): GameEvent | undefined {
  return ACTUALIDAD_EVENTS.find((e) => e.id === id);
}

function pickWeighted(
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

/** Prefer unseen actualidad beats; if all seen, reshuffle the pool. */
export function pickActualidadEvent(
  state: PlayerState,
  random = Math.random,
): GameEvent | null {
  const seen = new Set(state.actualidad_seen_ids ?? []);
  let pool = ACTUALIDAD_EVENTS.filter(
    (e) =>
      evaluateConditions(state, e.condiciones) &&
      e.id !== state.last_event_id &&
      !seen.has(e.id),
  );

  if (pool.length === 0) {
    pool = ACTUALIDAD_EVENTS.filter(
      (e) =>
        evaluateConditions(state, e.condiciones) &&
        e.id !== state.last_event_id,
    );
  }

  if (pool.length === 0) {
    pool = ACTUALIDAD_EVENTS.filter((e) =>
      evaluateConditions(state, e.condiciones),
    );
  }

  return pickWeighted(pool, random);
}

export function markActualidadSeen(
  state: PlayerState,
  eventId: string,
): PlayerState {
  if (!ACTUALIDAD_EVENTS.some((e) => e.id === eventId)) return state;
  const prev = state.actualidad_seen_ids ?? [];
  if (prev.includes(eventId)) return state;
  let next = [...prev, eventId];
  if (next.length >= ACTUALIDAD_EVENTS.length) {
    next = [eventId];
  }
  return { ...state, actualidad_seen_ids: next };
}
