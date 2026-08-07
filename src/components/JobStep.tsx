"use client";

import { getCredentialById } from "@/lib/credentials";
import { getEligibleJobs, monthlyJobCapitalSocial } from "@/lib/jobs";
import type { PlayerState } from "@/lib/types";

interface JobStepProps {
  state: PlayerState;
  onPick: (jobId: string | null) => void;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function JobStep({ state, onPick }: JobStepProps) {
  const eligible = getEligibleJobs(state)
    .sort((a, b) => b.sueldo - a.sueldo)
    .slice(0, 6);

  return (
    <article className="mx-auto w-full max-w-xl animate-in text-[#e8eef5]">
      <div className="h-1 w-full rounded-full bg-[#2f9e6b]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d9b6a]">
        Laburo
      </p>
      <h2 className="mt-1 font-display text-3xl leading-tight text-white sm:text-4xl">
        Oportunidades laborales
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#9aabbc]">
        Ahora sos {state.trabajo_actual.titulo} (
        {formatARS(state.trabajo_actual.sueldo)}/mes). Con secundario, mejores
        puestos te van sumando capital social cada mes. Cartonero no suma.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {eligible.map((job) => {
          const reqs = [
            ...(job.requisitos.credenciales_requeridas ?? []),
            ...(job.requisitos.credenciales_algunas ?? []),
          ]
            .slice(0, 2)
            .map((id) => getCredentialById(id)?.nombre ?? id);
          const csMes = monthlyJobCapitalSocial(state, job);

          return (
            <button
              key={job.id}
              type="button"
              onClick={() => onPick(job.id)}
              className="rounded-2xl border border-white/10 bg-[#1a222d] p-4 text-left transition hover:border-[#2f9e6b]/60"
            >
              <p className="font-semibold text-white">{job.titulo}</p>
              <p className="mt-1 text-xs text-[#8a9bac] line-clamp-2">
                {job.descripcion ?? job.rama}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                  {formatARS(job.sueldo)}/mes
                </span>
                {csMes > 0 ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    +{csMes} cap. social/mes
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#9aabbc]">
                    Sin cap. social/mes
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    job.nivel_estres_mensual <
                    state.trabajo_actual.nivel_estres_mensual
                      ? "bg-emerald-500/15 text-emerald-300"
                      : job.nivel_estres_mensual >
                          state.trabajo_actual.nivel_estres_mensual
                        ? "bg-rose-500/15 text-rose-300"
                        : "bg-white/10 text-[#9aabbc]"
                  }`}
                >
                  {job.nivel_estres_mensual <
                  state.trabajo_actual.nivel_estres_mensual
                    ? `Menos estrés (+${job.nivel_estres_mensual}/mes)`
                    : job.nivel_estres_mensual >
                        state.trabajo_actual.nivel_estres_mensual
                      ? `Más estrés (+${job.nivel_estres_mensual}/mes)`
                      : `+${job.nivel_estres_mensual} estrés/mes`}
                </span>
                {reqs.length > 0 ? (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#9aabbc]">
                    {reqs.join(" · ")}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}

        {eligible.length === 0 ? (
          <p className="sm:col-span-2 text-sm text-[#8a9bac]">
            No hay puestos nuevos con tus capacitaciones actuales.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => onPick(null)}
          className="rounded-2xl border border-white/10 bg-[#1a222d] p-4 text-left transition hover:border-white/25 sm:col-span-2"
        >
          <p className="font-semibold text-white">Seguir en el mismo laburo</p>
          <p className="mt-1 text-xs text-[#8a9bac]">
            {state.trabajo_actual.titulo} ·{" "}
            {formatARS(state.trabajo_actual.sueldo)}/mes
          </p>
          <span className="mt-3 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#9aabbc]">
            Sin cambios
          </span>
        </button>
      </div>
    </article>
  );
}
