import type { MetricKey, PlayerState } from "@/lib/types";

export type PartidoId =
  | "pj"
  | "ucr"
  | "lla"
  | "pro"
  | "izquierda"
  | "propio";

/** Deltas al afiliarte (one-shot). */
export type PartidoKpis = Partial<
  Record<MetricKey | "dinero", number>
>;

export interface PartidoDef {
  id: PartidoId;
  nombre: string;
  descripcion: string;
  /** Bonus/malus al entrar. */
  kpis: PartidoKpis;
  /** Drift chico cada mes mientras milites ahí. */
  mensual: PartidoKpis;
}

export const PARTIDOS: PartidoDef[] = [
  {
    id: "pj",
    nombre: "Justicialista",
    descripcion: "Territorio, doctrina y verticalidad. La estructura más gruesa.",
    kpis: {
      capital_social: 20,
      influencia: 6,
      estres: 6,
    },
    mensual: {
      capital_social: 2,
      influencia: 1,
      estres: 1,
    },
  },
  {
    id: "ucr",
    nombre: "Unión Cívica Radical",
    descripcion: "Comité, historia y peñas. Menos músculos, más ritual.",
    kpis: {
      capital_social: 10,
      influencia: 4,
      bienestar: 4,
    },
    mensual: {
      capital_social: 1,
      bienestar: 1,
    },
  },
  {
    id: "lla",
    nombre: "La Libertad Avanza",
    descripcion: "Motosierra, redes y fe de mercado. Entrás si bancás el relato.",
    kpis: {
      influencia: 14,
      capital_social: -10,
      estres: 10,
      bienestar: -4,
    },
    mensual: {
      influencia: 2,
      capital_social: -1,
      estres: 1,
    },
  },
  {
    id: "pro",
    nombre: "PRO",
    descripcion: "Gestión, powerpoints y zona norte. El traje importa.",
    kpis: {
      influencia: 8,
      capital_social: 6,
      bienestar: 3,
      estres: -3,
    },
    mensual: {
      influencia: 1,
      capital_social: 1,
    },
  },
  {
    id: "izquierda",
    nombre: "Izquierda / frente de base",
    descripcion: "Asamblea, bandeja y coherencia. Plata poca, militancia mucha.",
    kpis: {
      capital_social: 16,
      influencia: 3,
      estres: 8,
      dinero: -15000,
      bienestar: 2,
    },
    mensual: {
      capital_social: 2,
      estres: 1,
    },
  },
];

export const PARTIDO_PROPIO: Omit<PartidoDef, "id"> & { id: "propio" } = {
  id: "propio",
  nombre: "Tu espacio propio",
  descripcion: "Nombre, color y narrativa: tu estructura. Las coimas van al negro.",
  kpis: {
    influencia: 5,
    capital_social: 4,
    estres: 4,
  },
  mensual: {
    influencia: 2,
    capital_social: 1,
    estres: 1,
  },
};

export const INFLUENCIA_UNIRSE_PARTIDO = 25;
export const INFLUENCIA_CREAR_PARTIDO = 50;

const KPI_LABELS: Record<string, string> = {
  capital_social: "Cap. social",
  influencia: "Influencia",
  estres: "Estrés",
  bienestar: "Bienestar",
  salud: "Salud",
  dinero: "Plata",
};

export function getPartidoDef(
  partidoId: string | null | undefined,
): PartidoDef | null {
  if (!partidoId) return null;
  if (partidoId === "propio") return PARTIDO_PROPIO;
  return PARTIDOS.find((p) => p.id === partidoId) ?? null;
}

export function partidoLabel(
  partidoId: string | null | undefined,
  nombrePropio?: string | null,
): string | null {
  if (!partidoId) return null;
  if (partidoId === "propio") {
    return nombrePropio?.trim() || "Tu espacio propio";
  }
  return PARTIDOS.find((p) => p.id === partidoId)?.nombre ?? partidoId;
}

export function canJoinParty(influencia: number, partido: string | null): boolean {
  return influencia >= INFLUENCIA_UNIRSE_PARTIDO && !partido;
}

export function canCreateOrSwitchParty(
  influencia: number,
  _partido: string | null,
): boolean {
  if (influencia < INFLUENCIA_CREAR_PARTIDO) return false;
  return true;
}

export function applyPartidoKpis(
  state: PlayerState,
  kpis: PartidoKpis,
): PlayerState {
  let next = { ...state };
  for (const [key, raw] of Object.entries(kpis)) {
    const amount = Number(raw);
    if (!amount) continue;
    if (key === "dinero") {
      if (amount < 0) {
        const cost = Math.abs(amount);
        if (next.dinero >= cost) {
          next = { ...next, dinero: next.dinero - cost };
        } else {
          next = {
            ...next,
            deuda: next.deuda + (cost - next.dinero),
            dinero: 0,
          };
        }
      } else {
        next = { ...next, dinero: next.dinero + amount };
      }
      continue;
    }
    const metric = key as MetricKey;
    next = { ...next, [metric]: (next[metric] as number) + amount };
  }
  return next;
}

/** Chips para la UI: "+20 Cap. social", "−10 Cap. social". */
export function formatPartidoKpis(kpis: PartidoKpis): {
  text: string;
  bueno: boolean | null;
}[] {
  const order = [
    "capital_social",
    "influencia",
    "estres",
    "bienestar",
    "salud",
    "dinero",
  ];
  return order
    .filter((k) => kpis[k as keyof PartidoKpis])
    .map((k) => {
      const amount = kpis[k as keyof PartidoKpis]!;
      const label = KPI_LABELS[k] ?? k;
      const lowerIsGood = k === "estres";
      const bueno =
        amount === 0 ? null : lowerIsGood ? amount < 0 : amount > 0;
      const sign = amount > 0 ? "+" : "−";
      const abs =
        k === "dinero"
          ? `$${Math.abs(amount).toLocaleString("es-AR")}`
          : String(Math.abs(amount));
      return { text: `${sign}${abs} ${label}`, bueno };
    });
}
