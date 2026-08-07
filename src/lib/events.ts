import eventsData from "@/data/events.json";
import type { GameEvent } from "@/lib/types";

export const EVENTS: GameEvent[] = eventsData as GameEvent[];

export function getEventById(id: string): GameEvent | undefined {
  return EVENTS.find((event) => event.id === id);
}
