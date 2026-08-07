"use client";

import { getCredentialById } from "@/lib/credentials";
import { formatMetricDelta } from "@/lib/monthly-costs";
import type { PlayerState } from "@/lib/types";

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

export function MonthSummaryPanel({
  state,
  onContinue,
}: MonthSummaryPanelProps) {
  const ledger = state.last_month_ledger;
  if (!ledger) return null;

  const historias = ledger.historias ?? [];
  const malas = historias.filter((h) => h.tono === "malo");
  const buenas = historias.filter((h) => h.tono === "bueno");
  const estudios = ledger.estudios_completados ?? [];
  const interes = ledger.interes_deuda ?? 0;
  const pagoDeuda = ledger.pago_deuda ?? 0;

  return (
    <div className="mx-auto w-full max-w-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        Resumen del mes {state.mes}
      </p>
      <h2 className="mt-1 font-display text-3xl text-stone-950 sm:text-4xl">
        Lo que te dejó el mes
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        No es solo el sueldo: lo que pagás —o no— cambia oportunidades, puertas y
        reputación.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-sm border border-stone-800/10 bg-white/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            Sueldo
          </p>
          <p className="font-mono font-semibold text-emerald-800">
            +{formatARS(ledger.sueldo)}
          </p>
        </div>
        <div className="rounded-sm border border-stone-800/10 bg-white/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            Pagaste
          </p>
          <p className="font-mono font-semibold text-stone-800">
            −{formatARS(ledger.total_gastos)}
          </p>
        </div>
        <div className="rounded-sm border border-stone-800/10 bg-white/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            Salteaste
          </p>
          <p className="font-mono font-semibold text-amber-800">
            {formatARS(ledger.total_salteado ?? 0)}
          </p>
        </div>
        <div className="rounded-sm border border-stone-800/10 bg-white/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            Neto
          </p>
          <p
            className={`font-mono font-semibold ${
              ledger.neto >= 0 ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {formatARS(ledger.neto)}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-1.5 border-l border-stone-300 pl-3 text-sm text-stone-700">
        {ledger.lines.map((line) => (
          <li key={line.id} className="flex justify-between gap-4">
            <span>
              {line.label}
              {!line.pagado ? (
                <span className="ml-1 text-red-700">(no pagado)</span>
              ) : null}
            </span>
            <span className="font-mono tabular-nums text-stone-500">
              {line.pagado ? `−${formatARS(line.amount)}` : "—"}
            </span>
          </li>
        ))}
      </ul>

      {malas.length > 0 ? (
        <section className="mt-6 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-800/80">
            Consecuencias
          </h3>
          {malas.map((beat, i) => (
            <article
              key={`${beat.bill_id}-malo-${i}`}
              className="border border-red-900/15 bg-red-50/70 px-4 py-3"
            >
              <h4 className="font-medium text-red-950">{beat.titulo}</h4>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">
                {beat.texto}
              </p>
              <p className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-red-800">
                {beat.dinero !== 0 ? (
                  <span>{formatARS(beat.dinero)}</span>
                ) : null}
                {formatMetricDelta(beat.deltas).map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <p className="mt-6 text-sm text-emerald-800">
          Pagaste lo crítico: este mes no se te escapó ninguna oportunidad por
          cuentas.
        </p>
      )}

      {buenas.length > 0 ? (
        <section className="mt-5 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800/80">
            Oportunidades que sí agarraste
          </h3>
          {buenas.map((beat, i) => (
            <article
              key={`${beat.bill_id}-bueno-${i}`}
              className="border border-teal-900/15 bg-teal-50/60 px-4 py-3"
            >
              <h4 className="font-medium text-teal-950">{beat.titulo}</h4>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">
                {beat.texto}
              </p>
              <p className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-teal-800">
                {beat.dinero !== 0 ? (
                  <span>+{formatARS(beat.dinero)}</span>
                ) : null}
                {formatMetricDelta(beat.deltas).map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {estudios.length > 0 ? (
        <p className="mt-5 text-sm text-stone-700">
          Completaste:{" "}
          <span className="font-medium text-stone-900">
            {estudios
              .map((id) => getCredentialById(id)?.nombre ?? id)
              .join(", ")}
          </span>
        </p>
      ) : null}

      {pagoDeuda > 0 ? (
        <p className="mt-3 text-sm font-medium text-teal-800">
          Abonaste a la deuda: −{formatARS(pagoDeuda)}
          {state.deuda > 0 ? (
            <span className="ml-1 font-normal text-stone-600">
              (sigue debiendo {formatARS(state.deuda)})
            </span>
          ) : (
            <span className="ml-1 font-normal text-stone-600">
              (deuda en cero)
            </span>
          )}
        </p>
      ) : null}

      {interes > 0 ? (
        <p className="mt-3 text-sm font-medium text-red-800">
          Intereses de deuda: +{formatARS(interes)}
        </p>
      ) : null}

      <button type="button" className="advance-btn mt-8 w-full" onClick={onContinue}>
        Seguir
      </button>
    </div>
  );
}
