import internasData from "@/data/internas-questions.json";
import ballotageData from "@/data/ballotage-questions.json";
import { emptyAfinidades, rankPartidos, type PartidoAfinidades } from "@/lib/brujula";
import { partidoLabel, type PartidoId } from "@/lib/partidos";
import type { PlayerState } from "@/lib/types";

export interface EleccionOption {
  id: string;
  label: string;
  pesos?: Partial<PartidoAfinidades>;
  puntos?: number;
  tono?: "bueno" | "malo" | "neutro";
}

export interface EleccionQuestion {
  id: string;
  texto: string;
  opciones: EleccionOption[];
}

export const INTERNAS_QUESTIONS = internasData as EleccionQuestion[];
export const BALLOTAGE_QUESTIONS = ballotageData as EleccionQuestion[];

/** Puntos mínimos en ballotage para ganar (máx teórico ~15). */
export const BALLOTAGE_PUNTOS_GANAR = 10;

/** Margen: tu partido debe quedar 1º o a lo sumo 2 pts del top. */
export const INTERNAS_MARGEN_OK = 2;

export function applyPesos(
  scores: PartidoAfinidades,
  pesos: Partial<PartidoAfinidades> | undefined,
): PartidoAfinidades {
  if (!pesos) return scores;
  const next = { ...scores };
  for (const [partido, peso] of Object.entries(pesos)) {
    const key = partido as keyof PartidoAfinidades;
    next[key] = (next[key] ?? 0) + (peso ?? 0);
  }
  return next;
}

export function internasMatch(
  scores: PartidoAfinidades,
  partidoId: string | null,
): {
  matched: boolean;
  topId: Exclude<PartidoId, "propio">;
  yourScore: number;
  topScore: number;
  ranking: ReturnType<typeof rankPartidos>;
} {
  const ranking = rankPartidos(scores);
  const top = ranking[0]!;
  const topId = top.id;
  const topScore = top.score;

  if (!partidoId || partidoId === "propio") {
    // Espacio propio: ganás si tu discurso tiene identidad clara (top >= 4)
    return {
      matched: topScore >= 4,
      topId,
      yourScore: topScore,
      topScore,
      ranking,
    };
  }

  const yours = ranking.find((r) => r.id === partidoId);
  const yourScore = yours?.score ?? 0;
  const matched =
    yourScore >= topScore - INTERNAS_MARGEN_OK && yourScore > 0;

  return { matched, topId, yourScore, topScore, ranking };
}

export function shouldOfferInternas(state: PlayerState): boolean {
  if (!state.partido) return false;
  if (state.flags.includes("internas_ganadas")) return false;
  if (state.game_over) return false;
  // Cooldown tras perder
  const failAt = state.mes_internas_fail;
  if (typeof failAt === "number" && state.mes - failAt < 3) return false;
  const politicalJobs = [
    "militante_barrial",
    "operador_territorial",
    "concejal",
    "intendente",
    "gobernador",
    "presidente",
  ];
  const inPolitics =
    politicalJobs.includes(state.trabajo_actual.id) ||
    state.flags.some((f) => f.startsWith("worked_militante") || f.startsWith("worked_operador") || f.startsWith("worked_concejal"));
  return (
    state.edad >= 22 &&
    state.influencia >= 40 &&
    (inPolitics || state.influencia >= 45)
  );
}

export function shouldOfferBallotage(state: PlayerState): boolean {
  if (!state.partido) return false;
  if (!state.flags.includes("internas_ganadas")) return false;
  if (state.flags.includes("ballotage_ganado")) return false;
  if (state.game_over) return false;
  const failAt = state.mes_ballotage_fail;
  if (typeof failAt === "number" && state.mes - failAt < 3) return false;
  return state.influencia >= 50 && state.edad >= 24;
}

export function ballotageWon(puntos: number): boolean {
  return puntos >= BALLOTAGE_PUNTOS_GANAR;
}

export function emptyScores(): PartidoAfinidades {
  return emptyAfinidades();
}

export function describeInternasResult(
  matched: boolean,
  partidoId: string | null,
  partidoNombre: string | null,
  topId: string,
): string {
  const tuyo = partidoLabel(partidoId, partidoNombre) ?? "tu espacio";
  if (matched) {
    return `La mesa te compró el discurso. Matcheaste con ${tuyo}: salís candidato de la interna.`;
  }
  const otro = partidoLabel(topId) ?? topId;
  return `Hablaste como si fueras de ${otro}. En ${tuyo} no te compraron el verso. Perdiste la interna.`;
}

export type { PartidoAfinidades };
