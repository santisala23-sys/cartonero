"use client";

import { getCredentialById } from "@/lib/credentials";
import { rumboLines } from "@/lib/life-arcs";
import { isPoliticalCareer } from "@/lib/politica";
import type { MetricKey, PlayerState } from "@/lib/types";

interface MonthSummaryPanelProps {
  state: PlayerState;
  onContinue: () => void;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

const KPI_ROWS: {
  key: MetricKey | "dinero" | "dinero_negro" | "deuda";
  label: string;
  lowerIsGood?: boolean;
  politicalOnly?: boolean;
}[] = [
  { key: "influencia", label: "Influencia" },
  { key: "capital_social", label: "Cap. social" },
  { key: "salud", label: "Salud" },
  { key: "estres", label: "Estrés", lowerIsGood: true },
  { key: "bienestar", label: "Bienestar" },
  { key: "dinero", label: "En blanco" },
  { key: "dinero_negro", label: "En negro", politicalOnly: true },
  { key: "deuda", label: "Deuda", lowerIsGood: true },
];

function KpiBar({
  label,
  delta,
  lowerIsGood,
}: {
  label: string;
  delta: number;
  lowerIsGood?: boolean;
}) {
  const good =
    delta === 0 ? null : lowerIsGood ? delta < 0 : delta > 0;
  const barPct = Math.min(
    100,
    Math.max(
      8,
      Math.abs(delta) <= 0
        ? 0
        : Math.min(
            100,
            12 + Math.abs(delta) * (Math.abs(delta) > 500 ? 0.002 : 3),
          ),
    ),
  );

  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  const abs =
    label.includes("blanco") || label.includes("negro") || label === "Deuda"
      ? formatARS(Math.abs(delta))
      : String(Math.abs(Math.round(delta)));

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-[#9aabbc]">{label}</span>
        <span
          className={`font-mono font-semibold tabular-nums ${
            good === null
              ? "text-[#7a8b9c]"
              : good
                ? "text-emerald-300"
                : "text-rose-300"
          }`}
        >
          {delta === 0 ? "0" : `${sign}${abs}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#0d1117]">
        <div
          className={`h-full rounded-full transition-all ${
            good === null
              ? "bg-[#2a3441]"
              : good
                ? "bg-[#2f9e6b]"
                : "bg-[#c45c5c]"
          }`}
          style={{ width: delta === 0 ? "0%" : `${barPct}%` }}
        />
      </div>
    </div>
  );
}

export function MonthSummaryPanel({
  state,
  onContinue,
}: MonthSummaryPanelProps) {
  const ledger = state.last_month_ledger;
  if (!ledger) return null;

  const ecos = ledger.choice_ecos ?? [];
  const rumbo = rumboLines(state);
  const deltas = ledger.metric_deltas ?? {};
  const ganado = ledger.dinero_ganado ?? ledger.sueldo;
  const perdido = ledger.dinero_perdido ?? ledger.total_gastos;
  const margen = ledger.margen ?? ganado - perdido;
  const totalBlanco = state.dinero;
  const totalNegro = state.dinero_negro ?? 0;
  const showNegro = isPoliticalCareer(state) || totalNegro > 0;
  const estudios = ledger.estudios_completados ?? [];
  const politicas = showNegro;

  const kpis = KPI_ROWS.filter((row) => !row.politicalOnly || politicas);

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
      <div className="h-1 w-full rounded-full bg-[#2f9e6b]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d9b6a]">
        Resumen · trimestre {state.mes}
      </p>
      <h2 className="mt-1 font-display text-3xl italic text-white">
        Lo que te dejó el mes
      </h2>

      <div className="mt-5 rounded-xl bg-[#12161c] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7a8b9c]">
            Margen del mes
          </p>
          <p
            className={`font-display text-3xl tabular-nums ${
              margen >= 0 ? "text-[#5fd4a0]" : "text-[#e57373]"
            }`}
          >
            {margen >= 0 ? "+" : ""}
            {formatARS(margen)}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-[#7a8b9c]">Ganado</p>
            <p className="mt-0.5 font-mono font-semibold text-emerald-300">
              +{formatARS(ganado)}
            </p>
          </div>
          <div>
            <p className="text-[#7a8b9c]">Perdido</p>
            <p className="mt-0.5 font-mono font-semibold text-rose-300">
              −{formatARS(perdido)}
            </p>
          </div>
          <div>
            <p className="text-[#7a8b9c]">Total</p>
            <p className="mt-0.5 font-mono font-semibold text-[#5b9fd4]">
              {formatARS(totalBlanco + (showNegro ? totalNegro : 0))}
            </p>
          </div>
        </div>
        {showNegro ? (
          <div className="mt-3 flex justify-between border-t border-white/5 pt-2 text-[11px] text-[#9aabbc]">
            <span>Blanco {formatARS(totalBlanco)}</span>
            <span className="text-amber-200/90">Negro {formatARS(totalNegro)}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl border border-[#3d7ea6]/30 bg-[#12161c] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5b9fd4]">
          Tu rumbo
        </p>
        <ul className="mt-2 space-y-1.5">
          {rumbo.map((line) => (
            <li key={line} className="text-sm leading-snug text-[#c5d0db]">
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7a8b9c]">
          KPIs del mes
        </p>
        {kpis.map((row) => (
          <KpiBar
            key={row.key}
            label={row.label}
            delta={deltas[row.key] ?? 0}
            lowerIsGood={row.lowerIsGood}
          />
        ))}
      </div>

      {ecos.length > 0 ? (
        <ul className="mt-6 space-y-3 border-t border-white/5 pt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7a8b9c]">
            Lo que elegiste
          </p>
          {ecos.map((eco, i) => (
            <li
              key={`${eco.opcion_label}-${i}`}
              className="flex gap-3 border-l-2 border-[#3d7ea6] pl-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  {eco.event_titulo}
                </p>
                <p
                  className={`mt-0.5 text-sm leading-snug ${
                    eco.tono === "malo"
                      ? "text-rose-200/90"
                      : eco.tono === "bueno"
                        ? "text-emerald-200/90"
                        : "text-[#b0bec8]"
                  }`}
                >
                  {eco.texto}
                </p>
                {eco.risks && eco.risks.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {eco.risks.map((r, ri) => (
                      <p
                        key={`${eco.opcion_label}-r-${ri}`}
                        className={`text-[11px] ${
                          r.hit
                            ? "font-semibold text-emerald-300"
                            : "text-[#6a7b8c] line-through"
                        }`}
                      >
                        {Math.round(r.chance * 100)}%{" "}
                        {r.hints.join(" · ")}
                        {r.hit ? " · salió" : ""}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-[#9aabbc]">
        Este trimestre no hubo un evento decisivo — o se te escapó.
        </p>
      )}

      {estudios.length > 0 ? (
        <p className="mt-4 text-sm text-[#b0bec8]">
          Completaste{" "}
          {estudios
            .map((id) => getCredentialById(id)?.nombre ?? id)
            .join(", ")}
          .
        </p>
      ) : null}

      <button
        type="button"
        className="mt-6 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
        onClick={onContinue}
      >
        {state.game_over ? "Ver el final" : "Continuar"}
      </button>
    </article>
  );
}
