"use client";

import {
  CATEGORY_LABELS,
  credentialsByCategory,
  getAvailableCredentials,
  getCredentialById,
} from "@/lib/credentials";
import type { PlayerState } from "@/lib/types";

interface TrainingStepProps {
  state: PlayerState;
  onEnroll: (credentialId: string) => void;
  onContinue: () => void;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TrainingStep({
  state,
  onEnroll,
  onContinue,
}: TrainingStepProps) {
  const available = getAvailableCredentials(state);
  const byCat = credentialsByCategory(available);
  const studying = state.estudios_en_curso;
  const owned = state.credenciales
    .map((id) => getCredentialById(id))
    .filter(Boolean);

  return (
    <article className="event-card animate-in mx-auto w-full max-w-xl">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-900/70">
        Paso 1 · Capacitación
      </p>
      <h2 className="font-display text-2xl leading-tight text-stone-950 sm:text-3xl">
        Hacé una capacitación
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        Para tener mejores oportunidades laborales. Mirá cuánta plata tenés y
        cuánto sale cada curso. También podés seguir como estás.
      </p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border border-stone-800/10 bg-white/60 px-3 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Plata disponible
          </p>
          <p className="font-display text-2xl text-stone-900">
            {formatARS(state.dinero)}
          </p>
        </div>
        {state.deuda > 0 ? (
          <p className="font-mono text-sm text-red-700">
            Deuda {formatARS(state.deuda)}
          </p>
        ) : null}
      </div>

      {owned.length > 0 ? (
        <div className="mt-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Ya tenés
          </p>
          <div className="flex flex-wrap gap-1.5">
            {owned.map((c) =>
              c ? (
                <span
                  key={c.id}
                  className="rounded-sm bg-teal-900/10 px-1.5 py-0.5 text-[11px] font-medium text-teal-900"
                >
                  {c.nombre}
                </span>
              ) : null,
            )}
          </div>
        </div>
      ) : null}

      {studying.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-stone-700">
          {studying.map((s) => {
            const c = getCredentialById(s.credential_id);
            return (
              <li key={s.credential_id}>
                Cursando <strong>{c?.nombre ?? s.credential_id}</strong> —{" "}
                {s.meses_restantes} mes
                {s.meses_restantes === 1 ? "" : "es"} restante
                {s.meses_restantes === 1 ? "" : "s"}
              </li>
            );
          })}
        </ul>
      ) : null}

      {studying.length >= 2 ? (
        <p className="mt-4 text-sm text-stone-500">
          Máximo 2 formaciones a la vez. Seguí al siguiente paso.
        </p>
      ) : available.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          No hay cursos disponibles ahora. Sumá requisitos o plata otro mes.
        </p>
      ) : (
        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {Object.entries(byCat).map(([cat, items]) => (
            <div key={cat}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                {CATEGORY_LABELS[cat] ?? cat}
              </p>
              <ul className="flex flex-col gap-1.5">
                {items.map((c) => {
                  const canPay = state.dinero >= c.costo || c.costo <= 0;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => onEnroll(c.id)}
                        disabled={!canPay && c.costo > 0}
                        className="job-btn w-full text-left disabled:cursor-not-allowed disabled:opacity-45"
                        title={c.descripcion}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="block font-medium text-stone-900">
                            {c.nombre}
                          </span>
                          <span
                            className={`shrink-0 font-mono text-sm font-semibold ${
                              canPay ? "text-teal-900" : "text-red-800"
                            }`}
                          >
                            {c.costo <= 0 ? "Gratis" : formatARS(c.costo)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-stone-500">
                          {c.tipo}
                          {c.duracion_meses > 0
                            ? ` · ${c.duracion_meses} mes${c.duracion_meses > 1 ? "es" : ""}`
                            : " · inmediato"}
                          {c.estres > 0 ? ` · +${c.estres} estrés` : ""}
                          {!canPay && c.costo > 0 ? " · no te alcanza" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="advance-btn mt-6 w-full"
        onClick={onContinue}
      >
        Seguir como estoy
      </button>
      <p className="mt-2 text-center text-[11px] text-stone-500">
        Si anotaste un curso, también tocá acá para pasar al laburo.
      </p>
    </article>
  );
}
