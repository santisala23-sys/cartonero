import questionsData from "@/data/brujula-questions.json";
import { PARTIDOS, type PartidoId } from "@/lib/partidos";
import type { PlayerState } from "@/lib/types";

export type PartidoAfinidades = Record<Exclude<PartidoId, "propio">, number>;

export interface BrujulaOption {
  id: string;
  label: string;
  pesos: Partial<PartidoAfinidades>;
}

export interface BrujulaQuestion {
  id: string;
  texto: string;
  opciones: BrujulaOption[];
}

export const BRUJULA_QUESTIONS = questionsData as BrujulaQuestion[];

export function emptyAfinidades(): PartidoAfinidades {
  return { pj: 0, ucr: 0, lla: 0, pro: 0, izquierda: 0 };
}

export function applyOptionToScores(
  scores: PartidoAfinidades,
  option: BrujulaOption,
): PartidoAfinidades {
  const next = { ...scores };
  for (const [partido, peso] of Object.entries(option.pesos)) {
    const key = partido as keyof PartidoAfinidades;
    next[key] = (next[key] ?? 0) + (peso ?? 0);
  }
  return next;
}

export function rankPartidos(
  scores: PartidoAfinidades,
): { id: Exclude<PartidoId, "propio">; nombre: string; score: number }[] {
  return PARTIDOS.map((p) => ({
    id: p.id as Exclude<PartidoId, "propio">,
    nombre: p.nombre,
    score: scores[p.id as keyof PartidoAfinidades] ?? 0,
  })).sort((a, b) => b.score - a.score);
}

export function topPartido(
  scores: PartidoAfinidades,
): Exclude<PartidoId, "propio"> {
  return rankPartidos(scores)[0]?.id ?? "pj";
}

export function shouldOfferBrujula(state: PlayerState): boolean {
  if (state.partido) return false;
  if (state.flags.includes("brujula_completa")) return false;
  return state.edad >= 21 && state.influencia >= 35;
}
