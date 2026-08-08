"use client";

import { create } from "zustand";
import {
  advanceMonth,
  applyChoice,
  changeJob,
  chooseParty,
  continueFromJob,
  continueFromTraining,
  createInitialState,
  createProfile,
  dismissMonthSummary,
  dismissRiskReveal as clearRiskReveal,
  finishBallotage,
  finishBrujula,
  finishInternas,
  normalizePlayerState,
  resolveBills,
  startCredential,
} from "@/lib/game-engine";
import type { Genero, PlayerState } from "@/lib/types";
import type { PartidoId } from "@/lib/partidos";
import type { PartidoAfinidades } from "@/lib/brujula";
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
  createCharacter: (nombre: string, mesNacimiento: number, genero: Genero) => void;
  advance: () => void;
  choose: (optionId: string) => void;
  confirmBills: (decisions: Record<string, "pay" | "skip">) => void;
  dismissSummary: () => void;
  dismissRiskReveal: () => void;
  chooseParty: (partidoId: PartidoId | "skip", nombrePropio?: string) => void;
  finishBrujula: (
    scores: PartidoAfinidades,
    joinPartidoId: PartidoId | "skip",
  ) => void;
  finishInternas: (scores: PartidoAfinidades, won: boolean) => void;
  finishBallotage: (puntos: number, won: boolean) => void;
  pickTraining: (credentialId: string | null) => void;
  pickJob: (jobId: string | null) => void;
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

  createCharacter: (nombre, mesNacimiento, genero) => {
    const { state, playerKey } = get();
    const next = createProfile(state, nombre, mesNacimiento, genero);
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

  dismissRiskReveal: () => {
    const { state, playerKey } = get();
    const next = clearRiskReveal(state);
    set({ state: commit(next, playerKey) });
  },

  chooseParty: (partidoId, nombrePropio) => {
    const { state, playerKey } = get();
    const next = chooseParty(state, partidoId, nombrePropio);
    set({ state: commit(next, playerKey) });
  },

  finishBrujula: (scores, joinPartidoId) => {
    const { state, playerKey } = get();
    const next = finishBrujula(state, scores, joinPartidoId);
    set({ state: commit(next, playerKey) });
  },

  finishInternas: (scores, won) => {
    const { state, playerKey } = get();
    const next = finishInternas(state, scores, won);
    set({ state: commit(next, playerKey) });
  },

  finishBallotage: (puntos, won) => {
    const { state, playerKey } = get();
    const next = finishBallotage(state, puntos, won);
    set({ state: commit(next, playerKey) });
  },

  pickTraining: (credentialId) => {
    const { state, playerKey } = get();
    let next = state;
    if (credentialId) {
      next = startCredential(next, credentialId);
    }
    next = continueFromTraining(next);
    set({ state: commit(next, playerKey) });
  },

  pickJob: (jobId) => {
    const { state, playerKey } = get();
    let next = state;
    if (jobId) {
      next = changeJob(next, jobId);
    }
    if (next.game_over) {
      set({ state: commit(next, playerKey) });
      return;
    }
    next = continueFromJob(next);
    set({ state: commit(next, playerKey) });
  },

  reset: () => {
    const { playerKey } = get();
    const next = createInitialState();
    set({ state: commit(next, playerKey) });
  },
}));
