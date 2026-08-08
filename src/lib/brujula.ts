import questionsData from "@/data/brujula-questions.json";
import { PARTIDOS, type PartidoId } from "@/lib/partidos";
import type { PlayerState } from "@/lib/types";

export type BrujulaLikert =
  | "muy_acuerdo"
  | "acuerdo"
  | "depende"
  | "desacuerdo"
  | "muy_desacuerdo";

export interface BrujulaQuestion {
  id: string;
  texto: string;
  pesos: Partial<Record<Exclude<PartidoId, "propio">, number>>;
}

export const BRUJULA_QUESTIONS = questionsData as BrujulaQuestion[];

export const LIKERT_OPTIONS: {
  id: BrujulaLikert;
  label: string;
  mult: number;
  tone: string;
  emoji: string;
}[] = [
  { id: "muy_acuerdo", label: "Muy de acuerdo", mult: 2, tone: "bg-emerald-500/20", emoji: "😀" },
  { id: "acuerdo", label: "De acuerdo", mult: 1, tone: "bg-sky-500/15", emoji: "🙂" },
  { id: "depende", label: "Depende", mult: 0, tone: "bg-amber-500/15", emoji: "😐" },
  { id: "desacuerdo", label: "En desacuerdo", mult: -1, tone: "bg-orange-500/15", emoji: "☹️" },
  { id: "muy_desacuerdo", label: "Muy en desacuerdo", mult: -2, tone: "bg-rose-500/20", emoji: "😠" },
];

export type PartidoAfinidades = Record<Exclude<PartidoId, "propio">, number>;

export function emptyAfinidades(): PartidoAfinidades {
  return { pj: 0, ucr: 0, lla: 0, pro: 0, izquierda: 0 };
}

export function applyLikertToScores(
  scores: PartidoAfinidades,
  question: BrujulaQuestion,
  likert: BrujulaLikert,
): PartidoAfinidades {
  const mult = LIKERT_OPTIONS.find((o) => o.id === likert)?.mult ?? 0;
  const next = { ...scores };
  for (const [partido, peso] of Object.entries(question.pesos)) {
    const key = partido as keyof PartidoAfinidades;
    next[key] = (next[key] ?? 0) + (peso ?? 0) * mult;
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
  return (
    state.edad >= 21 &&
    state.influencia >= 35 &&
    !state.partido
  );
}
