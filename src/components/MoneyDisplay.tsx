"use client";

import { estimateMonthlyCosts } from "@/lib/monthly-costs";
import type { PlayerState } from "@/lib/types";

interface MoneyDisplayProps {
  state: PlayerState;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function MoneyDisplay({ state }: MoneyDisplayProps) {
  const {
    dinero,
    deuda,
    mes,
    trabajo_actual,
    last_month_ledger,
    estres,
    pending_bills,
  } = state;
  const estimado = estimateMonthlyCosts(state);

  return (
    <div className="border-b border-stone-800/15 pb-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Dinero
          </p>
          <p className="font-display text-3xl tracking-tight text-stone-900 sm:text-4xl">
            {formatARS(dinero)}
          </p>
          {deuda > 0 ? (
            <p className="mt-1 font-mono text-sm font-semibold text-red-700">
              Deuda {formatARS(deuda)}
              <span className="ml-1 text-[11px] font-normal text-red-600/80">
                (+12% / mes)
              </span>
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-stone-500">Mes {mes}</p>
          <p className="text-sm font-medium text-stone-800">
            {trabajo_actual.titulo}
          </p>
          <p className="text-xs text-stone-500">
            Sueldo {formatARS(trabajo_actual.sueldo)}/mes
          </p>
          <p className="text-xs text-stone-500">
            Gastos ~{formatARS(estimado)}/mes
          </p>
        </div>
      </div>

      {pending_bills ? (
        <p className="mt-3 text-xs font-medium text-amber-800">
          Tenés cuentas pendientes: elegí qué pagás y qué bancás.
        </p>
      ) : null}

      {estres > 90 && !pending_bills ? (
        <p className="mt-3 text-xs font-medium text-red-700">
          Estrés crítico: el psicólogo aparece en las cuentas del mes.
          {state.meses_estres_al_tope > 0 ? (
            <>
              {" "}
              Llevás {state.meses_estres_al_tope}/6 meses al tope — a los 6 te
              agarra un ACV
              {state.acv_count > 0
                ? ` (ya tuviste ${state.acv_count}/4)`
                : ""}
              .
            </>
          ) : null}
        </p>
      ) : null}

      {state.acv_count > 0 && estres <= 90 ? (
        <p className="mt-3 text-xs font-medium text-amber-900">
          ACVs: {state.acv_count}/4. El cuarto te mata.
        </p>
      ) : null}

      {last_month_ledger && last_month_ledger.lines.length > 0 ? (
        <details className="mt-3 text-xs text-stone-600">
          <summary className="cursor-pointer select-none font-medium text-stone-700">
            Último mes: cobraste {formatARS(last_month_ledger.sueldo)}, pagaste{" "}
            {formatARS(last_month_ledger.total_gastos)}
            {last_month_ledger.total_salteado ? (
              <>
                , salteaste {formatARS(last_month_ledger.total_salteado)}
              </>
            ) : null}
            <span
              className={
                last_month_ledger.neto >= 0
                  ? " text-emerald-700"
                  : " text-red-700"
              }
            >
              {" "}
              (neto {formatARS(last_month_ledger.neto)})
            </span>
          </summary>
          <ul className="mt-2 space-y-1 border-l border-stone-300 pl-3">
            {last_month_ledger.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span>
                  {line.label}
                  {!line.pagado ? (
                    <span className="ml-1 text-red-700">(no pagado)</span>
                  ) : null}
                </span>
                <span className="font-mono tabular-nums">
                  {line.pagado ? `-${formatARS(line.amount)}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
