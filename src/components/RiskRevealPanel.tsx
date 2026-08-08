"use client";

import { hintTone, toneClass } from "@/lib/effect-summary";
import type { RiskReveal } from "@/lib/types";

interface RiskRevealPanelProps {
  reveal: RiskReveal;
  onContinue: () => void;
}

export function RiskRevealPanel({ reveal, onContinue }: RiskRevealPanelProps) {
  const anyHit = reveal.risks.some((r) => r.hit);
  const headline = anyHit ? "Salió la tirada" : "No salió";

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
      <div
        className={`h-1 w-full rounded-full ${anyHit ? "bg-[#2f9e6b]" : "bg-[#c45c5c]"}`}
      />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9aabbc]">
        {reveal.event_titulo}
      </p>
      <h2 className="mt-1 font-display text-3xl italic text-white">{headline}</h2>
      <p className="mt-2 text-sm text-[#b0bec8]">
        Elegiste: <span className="text-white">{reveal.opcion_label}</span>
      </p>

      {reveal.guaranteed.length > 0 &&
      !(
        reveal.guaranteed.length === 1 &&
        reveal.guaranteed[0] === "Sin cambios"
      ) ? (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#6a7b8c]">
            Seguro
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reveal.guaranteed.map((h) => (
              <span
                key={h}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClass(hintTone(h))}`}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#6a7b8c]">
          Chances
        </p>
        {reveal.risks.map((risk, i) => {
          const pct = Math.round(risk.chance * 100);
          const label = risk.hints.join(" · ");
          const tone = hintTone(risk.hints[0] ?? "");
          return (
            <div
              key={`${pct}-${i}`}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                risk.hit
                  ? "border-[#2f9e6b]/60 bg-[#2f9e6b]/10 ring-1 ring-[#2f9e6b]/40"
                  : "border-white/5 bg-[#12161c] opacity-45"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${toneClass(tone).includes("emerald") ? "text-emerald-300" : toneClass(tone).includes("rose") ? "text-rose-300" : "text-[#c5d0db]"}`}
                >
                  {label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#7a8b9c]">
                  {risk.hit ? "Esta salió" : "No salió"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-black tabular-nums ${
                  risk.hit
                    ? "bg-[#2f9e6b] text-white"
                    : "bg-white/10 text-[#9aabbc]"
                }`}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-6 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
      >
        Seguir
      </button>
    </article>
  );
}
