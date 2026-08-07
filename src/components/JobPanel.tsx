"use client";

import { getCredentialById } from "@/lib/credentials";
import {
  getEligibleJobs,
  getJobById,
  JOBS,
} from "@/lib/jobs";
import type { Job, PlayerState } from "@/lib/types";

interface JobPanelProps {
  state: PlayerState;
  onSwitchJob: (jobId: string) => void;
  locked?: boolean;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function missingHints(state: PlayerState, job: Job): string[] {
  const req = job.requisitos;
  const missing: string[] = [];

  if (req.job_previo) {
    const ok =
      state.trabajo_actual.id === req.job_previo ||
      state.flags.includes(`worked_${req.job_previo}`);
    if (!ok) {
      const prev = getJobById(req.job_previo)?.titulo ?? req.job_previo;
      missing.push(`experiencia en ${prev}`);
    }
  }

  if (req.credenciales_requeridas?.length) {
    for (const id of req.credenciales_requeridas) {
      if (!state.credenciales.includes(id) && !(id === "curso_n8n" && state.flags.includes("curso_n8n"))) {
        missing.push(getCredentialById(id)?.nombre ?? id);
      }
    }
  }

  if (req.credenciales_algunas?.length) {
    const hasAny = req.credenciales_algunas.some(
      (id) =>
        state.credenciales.includes(id) ||
        (id === "curso_n8n" && state.flags.includes("curso_n8n")),
    );
    if (!hasAny) {
      missing.push(
        "alguna de: " +
          req.credenciales_algunas
            .map((id) => getCredentialById(id)?.nombre ?? id)
            .join(" / "),
      );
    }
  }

  if (req.dinero_min !== undefined && state.dinero < req.dinero_min) {
    missing.push(`plata (${formatARS(req.dinero_min)})`);
  }
  if (
    req.capital_social_min !== undefined &&
    state.capital_social < req.capital_social_min
  ) {
    missing.push(`capital social ${req.capital_social_min}+`);
  }
  if (req.salud_min !== undefined && state.salud < req.salud_min) {
    missing.push(`salud ${req.salud_min}+`);
  }

  return missing;
}

/** Jobs you almost qualify for — same rama ladder or missing only credentials. */
function getNearJobs(state: PlayerState, eligibleIds: Set<string>): Job[] {
  return JOBS.filter((job) => {
    if (job.id === state.trabajo_actual.id) return false;
    if (eligibleIds.has(job.id)) return false;
    const miss = missingHints(state, job);
    if (miss.length === 0 || miss.length > 3) return false;
    // Prefer same rama or entry jobs with only skill gaps
    const sameRama = job.rama === getJobById(state.trabajo_actual.id)?.rama;
    const onlySkills = miss.every(
      (m) =>
        !m.startsWith("experiencia") &&
        !m.startsWith("plata") &&
        !m.startsWith("capital") &&
        !m.startsWith("salud"),
    );
    return sameRama || onlySkills || miss.length <= 2;
  })
    .sort((a, b) => a.sueldo - b.sueldo)
    .slice(0, 8);
}

export function JobPanel({ state, onSwitchJob, locked }: JobPanelProps) {
  const eligible = getEligibleJobs(state);
  const eligibleIds = new Set(eligible.map((j) => j.id));
  const near = locked ? [] : getNearJobs(state, eligibleIds);

  return (
    <section className="mt-2">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        Cambiar trabajo
      </h3>
      {locked ? (
        <p className="text-sm text-stone-500">
          No podés cambiar de laburo durante un evento o el resumen del mes.
        </p>
      ) : eligible.length === 0 && near.length === 0 ? (
        <p className="text-sm text-stone-500">
          Ningún puesto a mano. Formate en Formación: aptitudes y cursos abren
          profesiones.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {eligible.map((job) => (
            <li key={job.id}>
              <button
                type="button"
                onClick={() => onSwitchJob(job.id)}
                className="job-btn w-full text-left"
              >
                <span className="block font-medium text-stone-900">
                  {job.titulo}
                </span>
                <span className="mt-0.5 block text-xs text-stone-500">
                  {formatARS(job.sueldo)}/mes · estrés +
                  {job.nivel_estres_mensual} · {job.rama}
                </span>
              </button>
            </li>
          ))}
          {near.map((job) => {
            const miss = missingHints(state, job);
            return (
              <li key={`near-${job.id}`}>
                <div className="rounded-sm border border-dashed border-stone-400/50 bg-stone-50/40 px-3 py-2 opacity-80">
                  <span className="block text-sm font-medium text-stone-600">
                    {job.titulo}
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-800">
                      bloqueado
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {formatARS(job.sueldo)}/mes · {job.rama}
                  </span>
                  <span className="mt-1 block text-[11px] text-amber-900/90">
                    Te falta: {miss.join(" · ")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
