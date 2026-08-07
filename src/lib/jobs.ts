import jobsData from "@/data/jobs.json";
import { hasAllCredentials, hasAnyCredential } from "@/lib/credentials";
import type { Job, PlayerState, TrabajoActual } from "@/lib/types";

export const JOBS: Job[] = jobsData as Job[];

export function getJobById(id: string): Job | undefined {
  return JOBS.find((job) => job.id === id);
}

export function jobToTrabajoActual(job: Job): TrabajoActual {
  return {
    id: job.id,
    titulo: job.titulo,
    sueldo: job.sueldo,
    nivel_estres_mensual: job.nivel_estres_mensual,
  };
}

export function createInitialTrabajo(): TrabajoActual {
  const cartonero = getJobById("cartonero");
  if (!cartonero) {
    throw new Error("Job inicial 'cartonero' no encontrado");
  }
  return jobToTrabajoActual(cartonero);
}

export function meetsJobRequirements(state: PlayerState, job: Job): boolean {
  const req = job.requisitos;

  if (req.job_previo) {
    const heldOrCurrent =
      state.trabajo_actual.id === req.job_previo ||
      state.flags.includes(`worked_${req.job_previo}`);
    if (!heldOrCurrent) return false;
  }

  if (req.dinero_min !== undefined && state.dinero < req.dinero_min) {
    return false;
  }

  if (
    req.capital_social_min !== undefined &&
    state.capital_social < req.capital_social_min
  ) {
    return false;
  }

  if (req.salud_min !== undefined && state.salud < req.salud_min) {
    return false;
  }

  if (req.flags_requeridos?.length) {
    for (const flag of req.flags_requeridos) {
      if (flag === "curso_n8n") {
        if (!hasAnyCredential(state, ["curso_n8n"]) && !state.flags.includes(flag)) {
          return false;
        }
      } else if (!state.flags.includes(flag)) {
        return false;
      }
    }
  }

  if (!hasAllCredentials(state, req.credenciales_requeridas)) {
    return false;
  }

  if (!hasAnyCredential(state, req.credenciales_algunas)) {
    return false;
  }

  return true;
}

export function getEligibleJobs(state: PlayerState): Job[] {
  return JOBS.filter(
    (job) =>
      job.id !== state.trabajo_actual.id && meetsJobRequirements(state, job),
  );
}

export function describeJobRequirements(job: Job): string[] {
  const bits: string[] = [];
  const req = job.requisitos;
  if (req.job_previo) bits.push(`Prev: ${req.job_previo}`);
  if (req.credenciales_requeridas?.length) {
    bits.push(`Cred: ${req.credenciales_requeridas.join(", ")}`);
  }
  if (req.credenciales_algunas?.length) {
    bits.push(`Alguna: ${req.credenciales_algunas.join(" | ")}`);
  }
  if (req.dinero_min) bits.push(`$${req.dinero_min}`);
  if (req.capital_social_min) bits.push(`CS ${req.capital_social_min}+`);
  return bits;
}
