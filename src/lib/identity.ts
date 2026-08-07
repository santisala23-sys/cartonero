import type { PlayerState } from "@/lib/types";

export const MESES_NOMBRE = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const INFLUENCIA_TIERS = [
  { min: 0, id: "nadie", label: "Nadie", nextAt: 15 },
  { min: 15, id: "conocido", label: "Conocido", nextAt: 35 },
  { min: 35, id: "con_peso", label: "Con peso", nextAt: 55 },
  { min: 55, id: "influyente", label: "Influyente", nextAt: 75 },
  { min: 75, id: "poderoso", label: "Poderoso", nextAt: 90 },
  { min: 90, id: "intocable", label: "Intocable", nextAt: 100 },
] as const;

export function getInfluenciaTier(influencia: number) {
  let tier: (typeof INFLUENCIA_TIERS)[number] = INFLUENCIA_TIERS[0];
  for (const row of INFLUENCIA_TIERS) {
    if (influencia >= row.min) tier = row;
  }
  return tier;
}

export function influenciaProgress(influencia: number): {
  tierLabel: string;
  value: number;
  max: number;
  ptsToNext: number;
  nextLabel: string | null;
} {
  const clamped = Math.max(0, Math.min(100, Math.round(influencia)));
  const tier = getInfluenciaTier(clamped);
  const idx = INFLUENCIA_TIERS.findIndex((t) => t.id === tier.id);
  const next = INFLUENCIA_TIERS[idx + 1] ?? null;
  const floor = tier.min;
  const ceil = next ? next.min : 100;
  const span = Math.max(1, ceil - floor);
  const value = clamped - floor;
  return {
    tierLabel: tier.label,
    value,
    max: span,
    ptsToNext: next ? Math.max(0, next.min - clamped) : 0,
    nextLabel: next?.label ?? null,
  };
}

/** Overall “MEDIA” rating like career sims. */
export function computeMedia(state: PlayerState): number {
  const raw =
    (state.salud +
      (100 - state.estres) +
      state.bienestar +
      state.capital_social +
      state.influencia) /
    5;
  return Math.max(1, Math.min(99, Math.round(raw)));
}

export function estadoCivilLabel(estado: PlayerState["estado_civil"]): string {
  switch (estado) {
    case "en_pareja":
      return "En pareja";
    case "casado":
      return "Casado/a";
    case "gatero":
      return "Gatero";
    default:
      return "Soltero/a";
  }
}

export interface BirthdayGift {
  titulo: string;
  texto: string;
  dinero: number;
  deltas: Partial<
    Record<"salud" | "estres" | "bienestar" | "capital_social" | "influencia", number>
  >;
}

export function birthdayGiftFor(state: PlayerState): BirthdayGift {
  const cs = state.capital_social;
  const edad = state.edad + 1;

  if (cs >= 70) {
    return {
      titulo: `Cumpleaños ${edad}`,
      texto: `Te armaron una fiesta. Regalos caros, abrazos y un poco de paz: con tu capital social, hasta el estrés afloja.`,
      dinero: 80000 + cs * 800,
      deltas: { estres: -18, bienestar: 14, capital_social: 4, influencia: 3 },
    };
  }
  if (cs >= 40) {
    return {
      titulo: `Cumpleaños ${edad}`,
      texto: `Asado con gente que te banca. No era un yate, pero te hicieron sentir alguien.`,
      dinero: 25000 + cs * 400,
      deltas: { estres: -10, bienestar: 10, capital_social: 2, influencia: 2 },
    };
  }
  if (cs >= 20) {
    return {
      titulo: `Cumpleaños ${edad}`,
      texto: `Un par de mensajes, una birra y un regalo chico. Alguien se acordó de vos.`,
      dinero: 8000,
      deltas: { estres: -4, bienestar: 6, influencia: 1 },
    };
  }
  return {
    titulo: `Cumpleaños ${edad}`,
    texto: `Casi nadie te felicitó. El día pasó como cualquier otro en la ciudad.`,
    dinero: 0,
    deltas: { bienestar: -4, estres: 4 },
  };
}
