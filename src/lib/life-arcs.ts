import type { PlayerState } from "@/lib/types";
import { getJobById } from "@/lib/jobs";
import { partidoLabel } from "@/lib/partidos";

export interface ArcStage {
  id: string;
  /** Cómo se muestra en el resumen de etapa. */
  label: string;
  /** True si el jugador ya llegó a este escalón. */
  match: (state: PlayerState) => boolean;
}

export interface LifeArc {
  id: string;
  nombre: string;
  /** Semilla: si no hay rastro, el arco no aparece. */
  isActive: (state: PlayerState) => boolean;
  stages: ArcStage[];
  /** Pista del próximo paso si no estás en el tope. */
  nextHint: (state: PlayerState, stageIndex: number) => string | null;
}

function has(state: PlayerState, flag: string): boolean {
  return state.flags.includes(flag);
}

function hasAny(state: PlayerState, flags: string[]): boolean {
  return flags.some((f) => state.flags.includes(f));
}

function jobId(state: PlayerState): string {
  return state.trabajo_actual.id;
}

function jobTags(state: PlayerState): string[] {
  return getJobById(state.trabajo_actual.id)?.tags ?? [];
}

const PENA_FLAGS = [
  "pena_boca_pena",
  "pena_racing",
  "pena_independiente",
  "pena_velez",
  "pena_huracan",
  "pena_gimnasia_lp",
  "pena_estudiantes_lp",
  "pena_newells",
  "pena_central",
  "pena_talleres",
  "pena_belgrano",
  "pena_lanus",
  "pena_banfield",
  "pena_argentinos",
  "pena_defensa",
  "pena_platense",
  "pena_godoy_cruz",
  "pena_atletico_tucuman",
  "pena_colon",
  "pena_union",
  "pena_instituto",
  "pena_sarmiento",
  "pena_barracas",
  "pena_tigre",
  "pena_arsenal",
  "pena_aldosivi",
  "pena_ferro",
  "pena_atlanta",
  "pena_chacarita",
  "pena_all_boys",
];

export const LIFE_ARCS: LifeArc[] = [
  {
    id: "futbol_boca",
    nombre: "Boca / dirigencia",
    isActive: (s) =>
      hasAny(s, [
        "barra_boca",
        "pena_boca_pena",
        "pena_boca_pena_bombo",
        "saludo_roman",
        "contacto_boca",
        "operador_boca",
        "empleado_club_boca",
        "dirigente_club",
      ]) || jobId(s) === "empleado_club_futbol" || jobId(s) === "dirigente_club",
    stages: [
      {
        id: "hincha",
        label: "Hincha con peña / barra",
        match: (s) =>
          hasAny(s, ["barra_boca", "pena_boca_pena", "pena_boca_pena_bombo"]),
      },
      {
        id: "roman",
        label: "Órbita Román",
        match: (s) => hasAny(s, ["saludo_roman", "contacto_boca"]),
      },
      {
        id: "operador",
        label: "Operador de internas",
        match: (s) => has(s, "operador_boca"),
      },
      {
        id: "club",
        label: "Laburo / dirigencia de club",
        match: (s) =>
          hasAny(s, ["empleado_club_boca", "dirigente_club", "presidente_club_barrio"]) ||
          jobId(s) === "empleado_club_futbol" ||
          jobId(s) === "dirigente_club",
      },
    ],
    nextHint: (_s, idx) => {
      const hints = [
        "Bancá la peña o la barra: Román aparece después.",
        "Si Román te saluda, pedí laburo o esperá el llamado.",
        "Las internas del club abren la puerta a un puesto.",
        "Ya estás adentro del mundo del fútbol.",
      ];
      return hints[Math.min(idx + 1, hints.length - 1)] ?? null;
    },
  },
  {
    id: "futbol_river",
    nombre: "River / Monumental",
    isActive: (s) =>
      hasAny(s, ["barra_river", "operador_river", "contacto_river"]),
    stages: [
      {
        id: "hincha",
        label: "Confianza en el Monumental",
        match: (s) => has(s, "barra_river"),
      },
      {
        id: "operador",
        label: "Operador de internas",
        match: (s) => hasAny(s, ["operador_river", "contacto_river"]),
      },
    ],
    nextHint: (_s, idx) =>
      idx < 0
        ? "La barra abre puertas en River."
        : "Las elecciones del club te pueden sumar.",
  },
  {
    id: "futbol_barrial",
    nombre: "Fútbol de barrio",
    isActive: (s) =>
      has(s, "hincha_activo") ||
      has(s, "presidente_club_barrio") ||
      has(s, "arco_futbol") ||
      PENA_FLAGS.some((f) => has(s, f)),
    stages: [
      {
        id: "pena",
        label: "De peña",
        match: (s) =>
          has(s, "arco_futbol") ||
          has(s, "hincha_activo") ||
          PENA_FLAGS.some((f) => has(s, f)),
      },
      {
        id: "presidente",
        label: "Presidente de club barrial",
        match: (s) => has(s, "presidente_club_barrio") || jobId(s) === "dirigente_club",
      },
    ],
    nextHint: (_s, idx) =>
      idx < 1
        ? "Con milanza de peña puede caer la presidencia de un club chico."
        : null,
  },
  {
    id: "politica",
    nombre: "Carrera política",
    isActive: (s) =>
      Boolean(s.partido) ||
      hasAny(s, [
        "interes_militancia",
        "worked_militante_barrial",
        "militancia_parcial",
      ]) ||
      getJobById(s.trabajo_actual.id)?.rama === "politica",
    stages: [
      {
        id: "interes",
        label: "Interés militante",
        match: (s) =>
          hasAny(s, ["interes_militancia", "militancia_parcial"]) ||
          Boolean(s.partido) ||
          getJobById(s.trabajo_actual.id)?.rama === "politica",
      },
      {
        id: "partido",
        label: "Afiliado a un partido",
        match: (s) => Boolean(s.partido),
      },
      {
        id: "cargo",
        label: "Cargo político",
        match: (s) =>
          [
            "militante_barrial",
            "operador_territorial",
            "concejal",
            "intendente",
            "gobernador",
            "presidente",
          ].includes(jobId(s)),
      },
    ],
    nextHint: (s, idx) => {
      if (idx < 1) return "Con influencia y edad te abren un partido.";
      if (idx < 2) {
        const p = partidoLabel(s.partido, s.partido_nombre);
        return p
          ? `Referente en órbita ${p}. El territorio abre cargos.`
          : "El territorio abre cargos.";
      }
      return null;
    },
  },
  {
    id: "tech",
    nombre: "Mundo tech / oficina",
    isActive: (s) =>
      hasAny(s, ["entrevista_tech_hecha", "curso_n8n"]) ||
      jobTags(s).some((t) => t === "tech" || t === "oficina"),
    stages: [
      {
        id: "entrada",
        label: "Pie en tech",
        match: (s) =>
          hasAny(s, ["entrevista_tech_hecha", "curso_n8n"]) ||
          jobTags(s).includes("tech"),
      },
      {
        id: "laburo",
        label: "Laburo tech/oficina",
        match: (s) => jobTags(s).some((t) => t === "tech" || t === "oficina"),
      },
    ],
    nextHint: (_s, idx) =>
      idx < 1 ? "Cursos y entrevistas abren el laburo formal." : null,
  },
  {
    id: "farandula",
    nombre: "Farándula / medios",
    isActive: (s) =>
      hasAny(s, [
        "alumno_wanda",
        "salio_en_susana",
        "gano_changuito",
        "alumno_beltran",
        "evento_milei_elon",
      ]),
    stages: [
      {
        id: "entrada",
        label: "En el radar mediático",
        match: (s) =>
          hasAny(s, [
            "alumno_wanda",
            "gano_changuito",
            "alumno_beltran",
            "salio_en_susana",
          ]),
      },
      {
        id: "prime",
        label: "Tele / figura",
        match: (s) => hasAny(s, ["salio_en_susana", "evento_milei_elon"]),
      },
    ],
    nextHint: (_s, idx) =>
      idx < 1 ? "Un reality o una academia te pueden catapultar." : null,
  },
];

export interface ArcProgress {
  arcId: string;
  nombre: string;
  stageLabel: string;
  stageIndex: number;
  maxStage: number;
  nextHint: string | null;
  complete: boolean;
}

export function evaluateLifeArcs(state: PlayerState): ArcProgress[] {
  const out: ArcProgress[] = [];
  for (const arc of LIFE_ARCS) {
    if (!arc.isActive(state)) continue;
    let stageIndex = -1;
    for (let i = 0; i < arc.stages.length; i++) {
      if (arc.stages[i].match(state)) stageIndex = i;
    }
    if (stageIndex < 0) {
      // Active seed but no stage matched — show as starting
      out.push({
        arcId: arc.id,
        nombre: arc.nombre,
        stageLabel: "Primeros pasos",
        stageIndex: -1,
        maxStage: arc.stages.length - 1,
        nextHint: arc.nextHint(state, -1),
        complete: false,
      });
      continue;
    }
    const complete = stageIndex >= arc.stages.length - 1;
    out.push({
      arcId: arc.id,
      nombre: arc.nombre,
      stageLabel: arc.stages[stageIndex].label,
      stageIndex,
      maxStage: arc.stages.length - 1,
      nextHint: complete ? null : arc.nextHint(state, stageIndex),
      complete,
    });
  }
  return out;
}

/** Líneas cortas para el cierre de trimestre. */
export function rumboLines(state: PlayerState): string[] {
  const arcs = evaluateLifeArcs(state);
  if (arcs.length === 0) {
    return [
      "Todavía no hay un rumbo claro: peña, militancia, curso o laburo van a marcar la cancha.",
    ];
  }
  return arcs.map((a) => {
    const base = `${a.nombre}: ${a.stageLabel}`;
    if (a.nextHint) return `${base}. → ${a.nextHint}`;
    return `${base}.`;
  });
}

/** Una sola línea para el dashboard. */
export function rumboHeadline(state: PlayerState): string | null {
  const arcs = evaluateLifeArcs(state);
  if (arcs.length === 0) return null;
  const top = arcs.sort((a, b) => b.stageIndex - a.stageIndex)[0];
  return `${top.nombre} · ${top.stageLabel}`;
}
