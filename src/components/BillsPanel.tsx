"use client";

import { useMemo, useState } from "react";
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

function buildAffordablePlan(
  bills: NonNullable<PlayerState["pending_bills"]>,
  dinero: number,
  deuda: number,
  preferDebt: boolean,
): Record<string, "pay" | "skip"> {
  const map: Record<string, "pay" | "skip"> = {};
  let remaining = dinero;
  for (const bill of bills) {
    if (bill.id === "pago_deuda") {
      map[bill.id] = preferDebt && remaining > 0 && deuda > 0 ? "pay" : "skip";
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
}

export function BillsPanel({ state, onConfirm }: BillsPanelProps) {
  const bills = state.pending_bills ?? [];
  const [abonarDeuda, setAbonarDeuda] = useState(false);
  const [modoDetalle, setModoDetalle] = useState(false);

  const plan = useMemo(
    () => buildAffordablePlan(bills, state.dinero, state.deuda, abonarDeuda),
    [bills, state.dinero, state.deuda, abonarDeuda],
  );

  const [decisions, setDecisions] = useState(plan);

  // Keep decisions in sync when debt toggle changes (unless user is in detail mode tweaking)
  const active = modoDetalle ? decisions : plan;

  const serviceBills = bills.filter((b) => b.id !== "pago_deuda");
  const debtBill = bills.find((b) => b.id === "pago_deuda");
  const aPagar = serviceBills.filter((b) => active[b.id] === "pay");
  const noAlcanza = serviceBills.filter((b) => active[b.id] !== "pay");
  const totalPay = aPagar.reduce((s, b) => s + b.amount, 0);
  const payingDebt = debtBill ? active[debtBill.id] === "pay" : false;
  const leftover = Math.max(0, state.dinero - totalPay);
  const debtPreview = payingDebt
    ? Math.min(state.deuda, leftover)
    : !payingDebt && aPagar.length > 0 && state.deuda > 0
      ? Math.min(state.deuda, leftover)
      : 0;

  function setChoice(id: string, choice: "pay" | "skip") {
    setModoDetalle(true);
    setDecisions((prev) => ({ ...prev, [id]: choice }));
  }

  function usePlan(preferDebt: boolean) {
    const next = buildAffordablePlan(
      bills,
      state.dinero,
      state.deuda,
      preferDebt,
    );
    setAbonarDeuda(preferDebt);
    setDecisions(next);
    setModoDetalle(false);
  }

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
      <div className="h-1 w-full rounded-full bg-[#2f9e6b]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d9b6a]">
        Cuentas
      </p>
      <h2 className="mt-1 font-display text-3xl text-white">Este mes</h2>
      <p className="mt-2 font-mono text-sm text-[#9aabbc]">
        Disponible {formatARS(state.dinero)}
        {state.deuda > 0 ? ` · Deuda ${formatARS(state.deuda)}` : ""}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#12161c] p-4">
        {aPagar.length > 0 ? (
          <p className="text-sm leading-relaxed text-[#c5d0dc]">
            Con lo que tenés{" "}
            <span className="font-semibold text-emerald-300">alcanzás</span> a
            pagar:{" "}
            <span className="text-white">
              {aPagar.map((b) => b.label).join(", ")}
            </span>
            <span className="text-[#7a8b9c]"> ({formatARS(totalPay)})</span>
          </p>
        ) : (
          <p className="text-sm text-rose-300">
            No te alcanza para ninguna cuenta este mes.
          </p>
        )}
        {noAlcanza.length > 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-[#c5d0dc]">
            <span className="font-semibold text-amber-300">No vas a poder</span>{" "}
            pagar:{" "}
            <span className="text-white">
              {noAlcanza.map((b) => b.label).join(", ")}
            </span>
            . Duele en el cuerpo y en las oportunidades.
          </p>
        ) : (
          <p className="mt-3 text-sm text-emerald-300/90">
            Cubís lo esencial. Bien.
          </p>
        )}
        {debtPreview > 0 ? (
          <p className="mt-3 text-sm text-teal-300">
            {payingDebt ? "Abonás a la deuda" : "Sobrante → deuda"}: −
            {formatARS(debtPreview)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => usePlan(false)}
          className="rounded-xl bg-[#2f9e6b] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
        >
          Pagar lo que alcanza
        </button>
        <button
          type="button"
          onClick={() => {
            const map: Record<string, "pay" | "skip"> = {};
            for (const b of bills) map[b.id] = "skip";
            setDecisions(map);
            setModoDetalle(true);
            setAbonarDeuda(false);
          }}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#9aabbc]"
        >
          No pagar nada
        </button>
        {state.deuda > 0 ? (
          <button
            type="button"
            onClick={() => usePlan(true)}
            className="rounded-xl border border-amber-500/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-amber-200"
          >
            Priorizar deuda
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => {
          if (!modoDetalle) setDecisions(plan);
          setModoDetalle((v) => !v);
        }}
        className="mt-4 text-xs text-[#6b7c8f] underline-offset-2 hover:text-[#9aabbc] hover:underline"
      >
        {modoDetalle ? "Ocultar detalle" : "Ajustar cuenta por cuenta"}
      </button>

      {modoDetalle ? (
        <ul className="mt-4 space-y-2">
          {bills.map((bill) => {
            const paying = active[bill.id] === "pay";
            return (
              <li
                key={bill.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">{bill.label}</p>
                  <p className="font-mono text-[11px] text-[#7a8b9c]">
                    {formatARS(bill.amount)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setChoice(bill.id, "pay")}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      paying
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/5 text-[#7a8b9c]"
                    }`}
                  >
                    Pagar
                  </button>
                  <button
                    type="button"
                    onClick={() => setChoice(bill.id, "skip")}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      !paying
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-white/5 text-[#7a8b9c]"
                    }`}
                  >
                    No
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <button
        type="button"
        className="mt-6 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
        onClick={() => onConfirm(modoDetalle ? decisions : plan)}
      >
        Confirmar y seguir
      </button>
    </article>
  );
}
