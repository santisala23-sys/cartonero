"use client";

import { create } from "zustand";
import {
  advanceMonth,
  applyChoice,
  changeJob,
  continueFromJob,
  continueFromTraining,
  createInitialState,
  createProfile,
  dismissMonthSummary,
  normalizePlayerState,
  resolveBills,
  startCredential,
} from "@/lib/game-engine";
import type { PlayerState } from "@/lib/types";
import {
  getOrCreatePlayerKey,
  loadLocalState,
  persistState,
} from "@/lib/persistence";

interface GameStore {
  state: PlayerState;
  hydrated: boolean;
  playerKey: string | null;
  hydrate: () => void;
  createCharacter: (nombre: string, mesNacimiento: number) => void;
  advance: () => void;
  choose: (optionId: string) => void;
  confirmBills: (decisions: Record<string, "pay" | "skip">) => void;
  dismissSummary: () => void;
  finishTraining: () => void;
  finishJobStep: () => void;
  switchJob: (jobId: string) => void;
  enroll: (credentialId: string) => void;
  reset: () => void;
}

function commit(state: PlayerState, playerKey: string | null): PlayerState {
  if (playerKey) {
    persistState(playerKey, state);
  }
  return state;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),
  hydrated: false,
  playerKey: null,

  hydrate: () => {
    if (get().hydrated) return;
    const playerKey = getOrCreatePlayerKey();
    const saved = loadLocalState();
    const normalized = normalizePlayerState(saved) ?? createInitialState();
    set({
      playerKey,
      state: normalized,
      hydrated: true,
    });
  },

  createCharacter: (nombre, mesNacimiento) => {
    const { state, playerKey } = get();
    const next = createProfile(state, nombre, mesNacimiento);
    set({ state: commit(next, playerKey) });
  },

  advance: () => {
    const { state, playerKey } = get();
    const next = advanceMonth(state);
    set({ state: commit(next, playerKey) });
  },

  choose: (optionId: string) => {
    const { state, playerKey } = get();
    const next = applyChoice(state, optionId);
    set({ state: commit(next, playerKey) });
  },

  confirmBills: (decisions) => {
    const { state, playerKey } = get();
    const next = resolveBills(state, decisions);
    set({ state: commit(next, playerKey) });
  },

  dismissSummary: () => {
    const { state, playerKey } = get();
    const next = dismissMonthSummary(state);
    set({ state: commit(next, playerKey) });
  },

  finishTraining: () => {
    const { state, playerKey } = get();
    const next = continueFromTraining(state);
    set({ state: commit(next, playerKey) });
  },

  finishJobStep: () => {
    const { state, playerKey } = get();
    const next = continueFromJob(state);
    set({ state: commit(next, playerKey) });
  },

  switchJob: (jobId: string) => {
    const { state, playerKey } = get();
    const next = changeJob(state, jobId);
    set({ state: commit(next, playerKey) });
  },

  enroll: (credentialId: string) => {
    const { state, playerKey } = get();
    const next = startCredential(state, credentialId);
    set({ state: commit(next, playerKey) });
  },

  reset: () => {
    const { playerKey } = get();
    const next = createInitialState();
    set({ state: commit(next, playerKey) });
  },
}));
