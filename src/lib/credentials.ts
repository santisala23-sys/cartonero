import credentialsData from "@/data/credentials.json";
import type { Credential, PlayerState } from "@/lib/types";

export const CREDENTIALS: Credential[] = credentialsData as Credential[];

export function getCredentialById(id: string): Credential | undefined {
  return CREDENTIALS.find((c) => c.id === id);
}

export function hasCredential(state: PlayerState, id: string): boolean {
  if (state.credenciales.includes(id)) return true;
  // Legacy bridge: old saves / events used flags for curso_n8n
  if (id === "curso_n8n" && state.flags.includes("curso_n8n")) return true;
  return false;
}

export function hasAllCredentials(
  state: PlayerState,
  ids: string[] | undefined,
): boolean {
  if (!ids?.length) return true;
  return ids.every((id) => hasCredential(state, id));
}

export function hasAnyCredential(
  state: PlayerState,
  ids: string[] | undefined,
): boolean {
  if (!ids?.length) return true;
  return ids.some((id) => hasCredential(state, id));
}

export function meetsCredentialRequirements(
  state: PlayerState,
  credential: Credential,
): boolean {
  const req = credential.requisitos;
  if (!hasAllCredentials(state, req.credenciales)) return false;
  if (req.dinero_min !== undefined && state.dinero < req.dinero_min) {
    return false;
  }
  if (
    req.capital_social_min !== undefined &&
    state.capital_social < req.capital_social_min
  ) {
    return false;
  }
  return true;
}

export function isStudying(state: PlayerState, credentialId: string): boolean {
  return state.estudios_en_curso.some((e) => e.credential_id === credentialId);
}

export function getAvailableCredentials(state: PlayerState): Credential[] {
  return CREDENTIALS.filter((c) => {
    if (hasCredential(state, c.id)) return false;
    if (isStudying(state, c.id)) return false;
    return meetsCredentialRequirements(state, c);
  });
}

export function credentialsByCategory(
  list: Credential[],
): Record<string, Credential[]> {
  return list.reduce<Record<string, Credential[]>>((acc, item) => {
    const key = item.categoria;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export const CATEGORY_LABELS: Record<string, string> = {
  educacion: "Educación",
  tech: "Tech",
  gastronomia: "Gastronomía",
  salud: "Salud",
  oficios: "Oficios",
  transporte: "Transporte",
  idiomas: "Idiomas",
  legal: "Legal / Contable",
  negocios: "Negocios",
  servicios: "Servicios",
  arte: "Arte y medios",
  seguridad: "Seguridad",
  politica: "Política",
  cartonero: "Reciclaje",
  comercio: "Comercio",
  campo: "Campo",
};
