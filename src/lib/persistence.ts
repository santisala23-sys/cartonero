import type { PlayerState } from "@/lib/types";

const STATE_KEY = "cartonero_save";
const PLAYER_KEY = "cartonero_player_key";

export function getOrCreatePlayerKey(): string {
  if (typeof window === "undefined") return "server";
  const existing = localStorage.getItem(PLAYER_KEY);
  if (existing) return existing;
  const key =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `player_${Date.now()}`;
  localStorage.setItem(PLAYER_KEY, key);
  return key;
}

export function loadLocalState(): PlayerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerState;
  } catch {
    return null;
  }
}

export function saveLocalState(state: PlayerState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function persistState(playerKey: string, state: PlayerState): void {
  saveLocalState(state);
  void syncToServer(playerKey, state);
}

async function syncToServer(
  playerKey: string,
  state: PlayerState,
): Promise<void> {
  try {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_key: playerKey, state }),
    });
  } catch {
    // Local play continues without Neon.
  }
}
