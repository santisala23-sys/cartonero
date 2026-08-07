"use client";

import { useMemo, useState } from "react";
import { hintTone, toneClassLight } from "@/lib/effect-summary";
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
      if (bill.id === "pago_deuda") {
        // Opt-in: debt payment is a conscious choice.
        map[bill.id] = "skip";
        continue;
      }
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

  const serviceBills = bills.filter((b) => b.id !== "pago_deuda");
  const debtBill = bills.find((b) => b.id === "pago_deuda");

  const servicesPayTotal = serviceBills
    .filter((b) => decisions[b.id] === "pay")
    .reduce((sum, b) => sum + b.amount, 0);
  const paidAnyServicePreview = serviceBills.some(
    (b) => decisions[b.id] === "pay",
  );

  const payingDebt = debtBill ? decisions[debtBill.id] === "pay" : false;
  const cashAfterServices = Math.max(0, state.dinero - servicesPayTotal);
  const debtPaymentPreview = payingDebt
    ? Math.min(state.deuda, Math.max(0, state.dinero - Math.min(servicesPayTotal, state.dinero)))
    : 0;

  // Services shortfall can create more debt; debt payment never does.
  const servicesShortfall = Math.max(0, servicesPayTotal - state.dinero);
  const cashAfterAllServices = Math.max(0, state.dinero - servicesPayTotal);
  const autoSurplusToDebt =
    paidAnyServicePreview && state.deuda > 0 && !payingDebt
      ? Math.min(state.deuda, cashAfterAllServices)
      : payingDebt
        ? Math.min(
            Math.max(0, state.deuda - debtPaymentPreview),
            Math.max(0, cashAfterAllServices - debtPaymentPreview),
          )
        : 0;

  function setChoice(id: string, choice: "pay" | "skip") {
    setDecisions((prev) => ({ ...prev, [id]: choice }));
  }

  function payAllAffordable() {
    const map: Record<string, "pay" | "skip"> = {};
    let remaining = state.dinero;
    for (const bill of bills) {
      if (bill.id === "pago_deuda") {
        map[bill.id] = remaining > 0 && state.deuda > 0 ? "pay" : "skip";
        continue;
      }
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
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-900/70">
        Paso 3 · Cuentas
      </p>
      <h2 className="font-display text-2xl leading-tight text-stone-950 sm:text-3xl">
        ¿Qué pagás este mes?
      </h2>
      <p className="mt-3 text-sm text-stone-600">
        Cobró el sueldo. Elegí qué servicios cubrís. Si no pagás nada, te
        quedás la plata (duele en salud/estrés) y la deuda no se cobra sola. Si
        pagás algo y te sobra, el sobrante baja la deuda. También podés elegir
        abonar la deuda a propósito.
      </p>
      <p className="mt-2 font-mono text-sm text-stone-800">
        Disponible: {formatARS(state.dinero)}
        {state.deuda > 0 ? (
          <span className="ml-2 text-red-700">
            · Deuda {formatARS(state.deuda)}
          </span>
        ) : null}
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
          const isDebt = bill.id === "pago_deuda";
          const hints = isDebt
            ? paying
              ? [
                  cashAfterServices >= state.deuda
                    ? `−${formatARS(state.deuda)} deuda`
                    : `Se descuenta todo (${formatARS(cashAfterServices)})`,
                  "−Estrés",
                ]
              : ["Sin pago este mes", "Te quedás la plata"]
            : formatMetricDelta(paying ? bill.al_pagar : bill.al_saltear);

          return (
            <li
              key={bill.id}
              className={`border px-3 py-3 ${
                isDebt
                  ? "border-amber-800/20 bg-amber-50/70"
                  : "border-stone-800/10 bg-white/50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-stone-900">{bill.label}</p>
                  <p className="font-mono text-xs text-stone-500">
                    {isDebt
                      ? `Debés ${formatARS(bill.amount)}`
                      : formatARS(bill.amount)}
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
                    className={`rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${toneClassLight(hintTone(hint))}`}
                  >
                    {hint}
                  </span>
                ))}
                {!isDebt && paying && bill.amount > state.dinero ? (
                  <span className="rounded-sm bg-amber-100/90 px-1.5 py-0.5 text-[11px] font-medium text-amber-950">
                    Si no alcanza, te endeudás
                  </span>
                ) : null}
                {isDebt && paying && state.deuda > cashAfterServices ? (
                  <span className="rounded-sm bg-emerald-100/90 px-1.5 py-0.5 text-[11px] font-medium text-emerald-900">
                    No te alcanza el total: se usa toda tu plata
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-stone-800/10 pt-4 text-sm text-stone-700">
        <p>
          Servicios:{" "}
          <span className="font-mono font-semibold">
            {formatARS(servicesPayTotal)}
          </span>
          {servicesShortfall > 0 ? (
            <span className="ml-2 text-red-700">
              (te faltan {formatARS(servicesShortfall)} → más deuda)
            </span>
          ) : null}
        </p>
        {payingDebt ? (
          <p className="mt-1 text-teal-800">
            A la deuda: −{formatARS(debtPaymentPreview)}
            {debtPaymentPreview < state.deuda
              ? ` (queda ${formatARS(state.deuda - debtPaymentPreview)})`
              : " (la saldás)"}
          </p>
        ) : null}
        {autoSurplusToDebt > 0 ? (
          <p className="mt-1 text-teal-800">
            Sobrante → deuda: −{formatARS(autoSurplusToDebt)}
          </p>
        ) : state.deuda > 0 && !payingDebt && cashAfterAllServices === 0 ? (
          <p className="mt-1 text-stone-500">
            Sin sobrante: la deuda sigue (y suma intereses).
          </p>
        ) : null}
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
