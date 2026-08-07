"use client";

import { useMemo, useState } from "react";
import { formatMetricDelta } from "@/lib/monthly-costs";
import type { PlayerState } from "@/lib/types";

interface BillsPanelProps {
  state: PlayerState;
  onConfirm: (decisions: Record<string, "pay" | "skip">) => void;
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BillsPanel({ state, onConfirm }: BillsPanelProps) {
  const bills = state.pending_bills ?? [];

  const initial = useMemo(() => {
    const map: Record<string, "pay" | "skip"> = {};
    let remaining = state.dinero;
    for (const bill of bills) {
      if (remaining >= bill.amount) {
        map[bill.id] = "pay";
        remaining -= bill.amount;
      } else {
        map[bill.id] = "skip";
      }
    }
    return map;
  }, [bills, state.dinero]);

  const [decisions, setDecisions] = useState(initial);

  const totalPay = bills
    .filter((b) => decisions[b.id] === "pay")
    .reduce((sum, b) => sum + b.amount, 0);
  const shortfall = Math.max(0, totalPay - state.dinero);

  function setChoice(id: string, choice: "pay" | "skip") {
    setDecisions((prev) => ({ ...prev, [id]: choice }));
  }

  function payAllAffordable() {
    const map: Record<string, "pay" | "skip"> = {};
    let remaining = state.dinero;
    for (const bill of bills) {
      if (remaining >= bill.amount) {
        map[bill.id] = "pay";
        remaining -= bill.amount;
      } else {
        map[bill.id] = "skip";
      }
    }
    setDecisions(map);
  }

  function skipAll() {
    const map: Record<string, "pay" | "skip"> = {};
    for (const bill of bills) map[bill.id] = "skip";
    setDecisions(map);
  }

  return (
    <article className="event-card animate-in mx-auto w-full max-w-xl">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-900/70">
        Cuentas del mes
      </p>
      <h2 className="font-display text-2xl leading-tight text-stone-950 sm:text-3xl">
        ¿Qué pagás este mes?
      </h2>
      <p className="mt-3 text-sm text-stone-600">
        Cobró el sueldo. Ahora elegí qué servicios cubrís. Si no pagás, duele en
        salud, estrés, bienestar o capital social.
      </p>
      <p className="mt-2 font-mono text-sm text-stone-800">
        Disponible: {formatARS(state.dinero)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="job-btn text-xs"
          onClick={payAllAffordable}
        >
          Pagar lo que alcanza
        </button>
        <button type="button" className="job-btn text-xs" onClick={skipAll}>
          No pagar nada
        </button>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {bills.map((bill) => {
          const choice = decisions[bill.id] ?? "pay";
          const paying = choice === "pay";
          const hints = formatMetricDelta(
            paying ? bill.al_pagar : bill.al_saltear,
          );
          return (
            <li
              key={bill.id}
              className="border border-stone-800/10 bg-white/50 px-3 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-stone-900">{bill.label}</p>
                  <p className="font-mono text-xs text-stone-500">
                    {formatARS(bill.amount)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChoice(bill.id, "pay")}
                    className={`px-2.5 py-1 text-xs font-semibold ${
                      paying
                        ? "bg-stone-900 text-white"
                        : "bg-stone-200/80 text-stone-600"
                    }`}
                  >
                    Pagar
                  </button>
                  <button
                    type="button"
                    onClick={() => setChoice(bill.id, "skip")}
                    className={`px-2.5 py-1 text-xs font-semibold ${
                      !paying
                        ? "bg-red-800 text-white"
                        : "bg-stone-200/80 text-stone-600"
                    }`}
                  >
                    No pagar
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hints.map((hint) => (
                  <span
                    key={hint}
                    className={`rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${
                      hint.startsWith("+")
                        ? "bg-emerald-100/90 text-emerald-900"
                        : "bg-red-100/90 text-red-900"
                    }`}
                  >
                    {hint}
                  </span>
                ))}
                {paying && bill.amount > state.dinero ? (
                  <span className="rounded-sm bg-amber-100/90 px-1.5 py-0.5 text-[11px] font-medium text-amber-950">
                    Si no alcanza, te endeudás
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-stone-800/10 pt-4 text-sm text-stone-700">
        <p>
          A pagar:{" "}
          <span className="font-mono font-semibold">{formatARS(totalPay)}</span>
          {shortfall > 0 ? (
            <span className="ml-2 text-red-700">
              (te faltan {formatARS(shortfall)} → deuda)
            </span>
          ) : null}
        </p>
      </div>

      <button
        type="button"
        className="advance-btn mt-5 w-full"
        onClick={() => onConfirm(decisions)}
      >
        Confirmar cuentas
      </button>
    </article>
  );
}
