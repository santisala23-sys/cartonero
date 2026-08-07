"use client";

import { getCredentialById } from "@/lib/credentials";
import { getEligibleJobs, getJobById } from "@/lib/jobs";
import type { PlayerState } from "@/lib/types";

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

function reqHint(jobId: string): string {
  const job = getJobById(jobId);
  if (!job) return "";
  const parts: string[] = [];
  const req = job.requisitos;
  if (req.credenciales_requeridas?.length) {
    parts.push(
      req.credenciales_requeridas
        .map((id) => getCredentialById(id)?.nombre ?? id)
        .join(", "),
    );
  }
  if (req.credenciales_algunas?.length) {
    parts.push(
      "alguna: " +
        req.credenciales_algunas
          .map((id) => getCredentialById(id)?.nombre ?? id)
          .join(" / "),
    );
  }
  return parts.join(" · ");
}

export function JobPanel({ state, onSwitchJob, locked }: JobPanelProps) {
  const eligible = getEligibleJobs(state);

  return (
    <section className="mt-2">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        Cambiar trabajo
      </h3>
      {locked ? (
        <p className="text-sm text-stone-500">
          No podés cambiar de laburo durante un evento.
        </p>
      ) : eligible.length === 0 ? (
        <p className="text-sm text-stone-500">
          Ningún puesto disponible. Formate, sumá contactos o plata.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {eligible.map((job) => {
            const hint = reqHint(job.id);
            return (
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
                  {hint ? (
                    <span className="mt-0.5 block text-[11px] text-teal-800/80">
                      {hint}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
