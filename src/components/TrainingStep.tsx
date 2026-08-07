"use client";

import { getAvailableCredentials, getCredentialById } from "@/lib/credentials";
import type { PlayerState } from "@/lib/types";

interface TrainingStepProps {
  state: PlayerState;
  onPick: (credentialId: string | null) => void;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TrainingStep({ state, onPick }: TrainingStepProps) {
  const studying = state.estudios_en_curso;
  const available = getAvailableCredentials(state)
    .filter((c) => studying.length < 2)
    .sort((a, b) => a.costo - b.costo)
    .slice(0, 6);

  return (
    <article className="mx-auto w-full max-w-xl animate-in text-[#e8eef5]">
      <div className="h-1 w-full rounded-full bg-[#2f9e6b]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d9b6a]">
        Estudios
      </p>
      <h2 className="mt-1 font-display text-3xl leading-tight text-white sm:text-4xl">
        Momento de capacitarte
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#9aabbc]">
        Tenés {formatARS(state.dinero)}. Elegí un curso o seguí así sin
        capacitarte este mes.
      </p>

      {studying.length > 0 ? (
        <p className="mt-3 text-xs text-[#7a8b9c]">
          Cursando:{" "}
          {studying
            .map((s) => getCredentialById(s.credential_id)?.nombre ?? s.credential_id)
            .join(" · ")}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {available.map((c) => {
          const canPay = c.costo <= 0 || state.dinero >= c.costo;
          return (
            <button
              key={c.id}
              type="button"
              disabled={!canPay}
              onClick={() => onPick(c.id)}
              className="rounded-2xl border border-white/10 bg-[#1a222d] p-4 text-left transition hover:border-[#2f9e6b]/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <p className="font-semibold text-white">{c.nombre}</p>
              <p className="mt-1 text-xs text-[#8a9bac] line-clamp-2">
                {c.descripcion ?? c.tipo}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                  {c.costo <= 0 ? "Gratis" : formatARS(c.costo)}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#9aabbc]">
                  {c.duracion_meses > 0
                    ? `${c.duracion_meses} mes${c.duracion_meses > 1 ? "es" : ""}`
                    : "Al toque"}
                </span>
                {c.estres > 0 ? (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-300">
                    +{c.estres} estrés
                  </span>
                ) : null}
                {!canPay ? (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-300">
                    No te alcanza
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPick(null)}
          className="rounded-2xl border border-white/10 bg-[#1a222d] p-4 text-left transition hover:border-white/25 sm:col-span-2"
        >
          <p className="font-semibold text-white">Seguir así</p>
          <p className="mt-1 text-xs text-[#8a9bac]">
            Sin curso este mes. Pasás directo a oportunidades laborales.
          </p>
          <span className="mt-3 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#9aabbc]">
            Sin cambios
          </span>
        </button>
      </div>
    </article>
  );
}
