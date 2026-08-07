"use client";

import {
  CATEGORY_LABELS,
  CREDENTIALS,
  credentialsByCategory,
  getAvailableCredentials,
  getCredentialById,
} from "@/lib/credentials";
import type { PlayerState } from "@/lib/types";

interface SkillsPanelProps {
  state: PlayerState;
  onEnroll: (credentialId: string) => void;
  locked?: boolean;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SkillsPanel({ state, onEnroll, locked }: SkillsPanelProps) {
  const owned = state.credenciales
    .map((id) => getCredentialById(id))
    .filter(Boolean);
  const available = getAvailableCredentials(state);
  const byCat = credentialsByCategory(available);
  const studying = state.estudios_en_curso;

  return (
    <section className="mt-5">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        Formación · aptitudes y credenciales
      </h3>

      {owned.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {owned.map((c) =>
            c ? (
              <span
                key={c.id}
                className="rounded-sm bg-teal-900/10 px-1.5 py-0.5 text-[11px] font-medium text-teal-900"
                title={c.descripcion}
              >
                {c.nombre}
              </span>
            ) : null,
          )}
        </div>
      ) : (
        <p className="mb-3 text-sm text-stone-500">
          Todavía no tenés títulos ni cursos. Empezá por la primaria.
        </p>
      )}

      {studying.length > 0 ? (
        <ul className="mb-3 space-y-1 text-sm text-stone-700">
          {studying.map((s) => {
            const c = getCredentialById(s.credential_id);
            return (
              <li key={s.credential_id}>
                Cursando <strong>{c?.nombre ?? s.credential_id}</strong> —{" "}
                {s.meses_restantes} mes{s.meses_restantes === 1 ? "" : "es"}{" "}
                restante{s.meses_restantes === 1 ? "" : "s"}
              </li>
            );
          })}
        </ul>
      ) : null}

      {locked ? (
        <p className="text-sm text-stone-500">
          No podés anotarte a cursos durante un evento.
        </p>
      ) : studying.length >= 2 ? (
        <p className="text-sm text-stone-500">
          Máximo 2 formaciones a la vez. Esperá a terminar alguna.
        </p>
      ) : available.length === 0 ? (
        <p className="text-sm text-stone-500">
          Nada disponible ahora. Sumá plata, terminá cursos previos o subí
          capital social.
        </p>
      ) : (
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {Object.entries(byCat).map(([cat, items]) => (
            <div key={cat}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                {CATEGORY_LABELS[cat] ?? cat}
              </p>
              <ul className="flex flex-col gap-1.5">
                {items.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onEnroll(c.id)}
                      className="job-btn w-full text-left"
                      title={c.descripcion}
                    >
                      <span className="block font-medium text-stone-900">
                        {c.nombre}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-500">
                        {c.tipo} ·{" "}
                        {c.costo <= 0 ? "Gratis" : formatARS(c.costo)}
                        {c.duracion_meses > 0
                          ? ` · ${c.duracion_meses} mes${c.duracion_meses > 1 ? "es" : ""}`
                          : " · inmediato"}
                        {c.estres > 0 ? ` · +${c.estres} estrés` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-stone-400">
        Catálogo: {CREDENTIALS.length} credenciales · desbloquean puestos
      </p>
    </section>
  );
}
