"use client";

import { getCredentialById } from "@/lib/credentials";
import { getEligibleJobs, getJobById, JOBS } from "@/lib/jobs";
import type { Job, PlayerState } from "@/lib/types";

interface JobStepProps {
  state: PlayerState;
  onSwitchJob: (jobId: string) => void;
  onContinue: () => void;
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
      missing.push(
        `experiencia en ${getJobById(req.job_previo)?.titulo ?? req.job_previo}`,
      );
    }
  }

  if (req.credenciales_requeridas?.length) {
    for (const id of req.credenciales_requeridas) {
      if (
        !state.credenciales.includes(id) &&
        !(id === "curso_n8n" && state.flags.includes("curso_n8n"))
      ) {
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

  return missing;
}

export function JobStep({ state, onSwitchJob, onContinue }: JobStepProps) {
  const eligible = getEligibleJobs(state);
  const eligibleIds = new Set(eligible.map((j) => j.id));
  const near = JOBS.filter((job) => {
    if (job.id === state.trabajo_actual.id) return false;
    if (eligibleIds.has(job.id)) return false;
    const miss = missingHints(state, job);
    return miss.length > 0 && miss.length <= 2;
  })
    .sort((a, b) => a.sueldo - b.sueldo)
    .slice(0, 6);

  return (
    <article className="event-card animate-in mx-auto w-full max-w-xl">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-900/70">
        Paso 2 · Trabajo
      </p>
      <h2 className="font-display text-2xl leading-tight text-stone-950 sm:text-3xl">
        ¿Cambias de laburo?
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        Si te capacitaste, tal vez se abrieron puertas. Si no, podés seguir donde
        estás.
      </p>

      <div className="mt-4 border border-stone-800/10 bg-white/60 px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          Ahora
        </p>
        <p className="font-medium text-stone-900">
          {state.trabajo_actual.titulo}
        </p>
        <p className="font-mono text-xs text-stone-500">
          {formatARS(state.trabajo_actual.sueldo)}/mes · estrés +
          {state.trabajo_actual.nivel_estres_mensual}
        </p>
      </div>

      {eligible.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          Ningún puesto nuevo disponible. Formate el mes que viene o sumá
          contactos.
        </p>
      ) : (
        <ul className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
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
        </ul>
      )}

      {near.length > 0 ? (
        <div className="mt-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800/80">
            Casi al alcance
          </p>
          <ul className="space-y-1.5">
            {near.map((job) => (
              <li
                key={job.id}
                className="border border-dashed border-stone-400/40 bg-stone-50/50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-stone-600">{job.titulo}</span>
                <span className="mt-0.5 block text-[11px] text-amber-900/90">
                  Te falta: {missingHints(state, job).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        className="advance-btn mt-6 w-full"
        onClick={onContinue}
      >
        Seguir en el mismo laburo
      </button>
      <p className="mt-2 text-center text-[11px] text-stone-500">
        Si cambiaste de puesto, tocá acá para ir a las cuentas del mes.
      </p>
    </article>
  );
}
