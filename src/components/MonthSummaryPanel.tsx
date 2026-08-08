"use client";

import { getCredentialById } from "@/lib/credentials";
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
  const highlight =
    malas[0] ?? buenas[0] ?? null;
  const estudios = ledger.estudios_completados ?? [];
  const interes = ledger.interes_deuda ?? 0;
  const pagoDeuda = ledger.pago_deuda ?? 0;
  const pagadas = (ledger.lines ?? []).filter((l) => l.pagado);
  const salteadas = (ledger.lines ?? []).filter((l) => !l.pagado);

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
      <div className="h-1 w-full rounded-full bg-[#2f9e6b]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d9b6a]">
        Resumen · mes {state.mes}
      </p>
      <h2 className="mt-1 font-display text-3xl text-white">
        Lo que te dejó el mes
      </h2>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-[#12161c] px-2 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[#7a8b9c]">
            Sueldo
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-emerald-300">
            +{formatARS(ledger.sueldo)}
          </p>
        </div>
        <div className="rounded-xl bg-[#12161c] px-2 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[#7a8b9c]">
            Pagaste
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-white">
            −{formatARS(ledger.total_gastos)}
          </p>
        </div>
        <div className="rounded-xl bg-[#12161c] px-2 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[#7a8b9c]">
            Neto
          </p>
          <p
            className={`mt-1 font-mono text-sm font-semibold ${
              ledger.neto >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {formatARS(ledger.neto)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-sm leading-relaxed text-[#b0bec8]">
        {pagadas.length > 0 ? (
          <p>
            <span className="text-emerald-300">Pagaste</span>{" "}
            {pagadas.map((l) => l.label).join(", ")}.
          </p>
        ) : (
          <p className="text-amber-200">No pagaste ninguna cuenta.</p>
        )}
        {salteadas.length > 0 ? (
          <p>
            <span className="text-amber-300">Quedó pendiente</span>{" "}
            {salteadas.map((l) => l.label).join(", ")}.
          </p>
        ) : (
          <p className="text-emerald-300/90">Cubristes lo esencial.</p>
        )}
        {pagoDeuda > 0 ? (
          <p className="text-teal-300">
            Abono a deuda −{formatARS(pagoDeuda)}
            {state.deuda > 0 ? ` · sigue ${formatARS(state.deuda)}` : " · cero"}
          </p>
        ) : null}
        {interes > 0 ? (
          <p className="text-rose-300">Intereses +{formatARS(interes)}</p>
        ) : null}
        {estudios.length > 0 ? (
          <p>
            Completaste{" "}
            {estudios
              .map((id) => getCredentialById(id)?.nombre ?? id)
              .join(", ")}
            .
          </p>
        ) : null}
      </div>

      {highlight ? (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 ${
            highlight.tono === "malo"
              ? "border-rose-500/30 bg-rose-500/10"
              : "border-emerald-500/30 bg-emerald-500/10"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9aabbc]">
            {highlight.tono === "malo" ? "Lo más jodido" : "Lo mejor"}
            {malas.length + buenas.length > 1
              ? ` · +${malas.length + buenas.length - 1} más`
              : ""}
          </p>
          <p className="mt-1 font-semibold text-white">{highlight.titulo}</p>
          <p className="mt-1 text-sm text-[#b0bec8] line-clamp-3">
            {highlight.texto}
          </p>
        </div>
      ) : malas.length === 0 ? (
        <p className="mt-5 text-sm text-emerald-300">
          Mes prolijo: no se te escapó nada crítico por las cuentas.
        </p>
      ) : null}

      <button
        type="button"
        className="mt-6 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
        onClick={onContinue}
      >
        {state.game_over ? "Ver el final" : "Seguir"}
      </button>
    </article>
  );
}
