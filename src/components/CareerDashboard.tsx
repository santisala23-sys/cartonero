"use client";

import {
  computeMedia,
  estadoCivilLabel,
  influenciaProgress,
  MESES_NOMBRE,
} from "@/lib/identity";
import { VIVIENDA_LABEL } from "@/lib/housing";
import type { PlayerState } from "@/lib/types";

interface CareerDashboardProps {
  state: PlayerState;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#1a222d] px-3 py-3 text-center">
      <p className={`font-display text-2xl tabular-nums ${accent ?? "text-white"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7a8b9c]">
        {label}
      </p>
    </div>
  );
}

function hadRecentAcv(state: PlayerState): boolean {
  if (!state.pending_month_summary || state.acv_count <= 0) return false;
  return Boolean(
    state.last_month_ledger?.historias?.some((h) => {
      const t = h.titulo.toLowerCase();
      return t.includes("acv") || t.includes("bobazo");
    }),
  );
}

export function CareerDashboard({ state }: CareerDashboardProps) {
  const media = computeMedia(state);
  const influ = influenciaProgress(state.influencia);
  const mesNombre = MESES_NOMBRE[state.mes_calendario - 1] ?? "";
  const showAcv = state.estres >= 100 || hadRecentAcv(state);

  return (
    <section className="rounded-2xl bg-[#12161c] p-4 text-[#e8eef5] sm:p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#1a222d]">
          <p className="font-display text-3xl leading-none text-white">{media}</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#7a8b9c]">
            Media
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl text-white sm:text-2xl">
            {state.nombre || "Sin nombre"}
          </p>
          <p className="mt-0.5 text-xs text-[#9aabbc]">
            {state.trabajo_actual.titulo.toUpperCase()} · {state.anio_calendario} ·{" "}
            {state.edad} AÑOS
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#3d9b6a]">
            {mesNombre} · mes de juego {state.mes}
          </p>
          <p className="mt-1 text-[11px] text-[#8a9bac]">
            {state.genero === "mujer" ? "Mujer" : "Hombre"} ·{" "}
            {estadoCivilLabel(state.estado_civil)}
            {state.hijos > 0 ? ` · ${state.hijos} hijo${state.hijos > 1 ? "s" : ""}` : ""}
            {" · "}
            {VIVIENDA_LABEL[state.vivienda]}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Dinero" value={formatARS(state.dinero)} accent="text-[#5b9fd4]" />
        <StatTile
          label="Deuda"
          value={formatARS(state.deuda)}
          accent={state.deuda > 0 ? "text-[#e2b04a]" : "text-white"}
        />
        <StatTile label="Sueldo" value={formatARS(state.trabajo_actual.sueldo)} />
        <StatTile label="Influencia" value={Math.round(state.influencia)} accent="text-[#3d9b6a]" />
      </div>

      <div
        className={`mt-3 grid gap-2 ${
          showAcv
            ? "grid-cols-3 sm:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        <StatTile label="Salud" value={Math.round(state.salud)} />
        <StatTile
          label="Estrés"
          value={Math.round(state.estres)}
          accent={state.estres >= 100 ? "text-[#e57373]" : undefined}
        />
        <StatTile label="Bienestar" value={Math.round(state.bienestar)} />
        <StatTile label="Cap. social" value={Math.round(state.capital_social)} />
        {showAcv ? (
          <StatTile
            label="ACVs"
            value={`${state.acv_count}/4`}
            accent="text-[#e57373]"
          />
        ) : null}
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9aabbc]">
            Influencia y poder
          </p>
          <p className="text-xs font-semibold text-white">
            {influ.tierLabel.toUpperCase()} · {Math.round(state.influencia)}/100
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#2a3440]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2f9e6b] to-[#5fd4a0]"
            style={{
              width: `${Math.min(100, (state.influencia / 100) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[#8a9bac]">
          {influ.nextLabel
            ? `Te faltan ${influ.ptsToNext} pts para ser ${influ.nextLabel}`
            : "Estás en la cima de la influencia."}
        </p>
      </div>
    </section>
  );
}
