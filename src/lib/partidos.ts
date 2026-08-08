export type PartidoId =
  | "pj"
  | "ucr"
  | "lla"
  | "pro"
  | "izquierda"
  | "propio";

export interface PartidoDef {
  id: PartidoId;
  nombre: string;
  descripcion: string;
}

export const PARTIDOS: PartidoDef[] = [
  {
    id: "pj",
    nombre: "Justicialista",
    descripcion: "Territorio, doctrina y verticalidad. La estructura más gruesa.",
  },
  {
    id: "ucr",
    nombre: "Unión Cívica Radical",
    descripcion: "Comité, historia y peñas. Menos músculos, más ritual.",
  },
  {
    id: "lla",
    nombre: "La Libertad Avanza",
    descripcion: "Motosierra, redes y fe de mercado. Entrás si bancás el relato.",
  },
  {
    id: "pro",
    nombre: "PRO",
    descripcion: "Gestión, powerpoints y zona norte. El traje importa.",
  },
  {
    id: "izquierda",
    nombre: "Izquierda / frente de base",
    descripcion: "Asamblea, bandeja y coherencia. Plata poca, militancia mucha.",
  },
];

export const INFLUENCIA_UNIRSE_PARTIDO = 25;
export const INFLUENCIA_CREAR_PARTIDO = 50;

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
  // At 50 you can create your own or switch once unlocked
  return true;
}
