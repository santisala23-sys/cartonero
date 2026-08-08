"use client";

import {
  hintTone,
  summarizeOptionBranches,
  toneClass,
} from "@/lib/effect-summary";
import type { GameEvent } from "@/lib/types";

interface EventCardProps {
  event: GameEvent;
  onChoose: (optionId: string) => void;
  disabled?: boolean;
  dinero?: number;
}

function ChancePill({
  hints,
  chance,
}: {
  hints: string[];
  chance: number;
}) {
  const label = hints[0] ?? "Sin cambios";
  const tone = hintTone(label);
  const pct = Math.round(chance * 100);
  return (
    <div
      className={`flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 text-[12px] font-semibold leading-snug ${toneClass(tone)}`}
    >
      <span className="min-w-0 truncate">{hints.join(" · ")}</span>
      <span className="shrink-0 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-bold tabular-nums text-white/90">
        {pct}%
      </span>
    </div>
  );
}

export function EventCard({
  event,
  onChoose,
  disabled,
  dinero = 0,
}: EventCardProps) {
  const twoCols = event.opciones.length === 2;

  return (
    <article className="mx-auto w-full max-w-xl animate-in text-[#e8eef5]">
      <div className="h-1 w-full rounded-full bg-[#2f9e6b]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#3d9b6a]">
        Pasan cosas
      </p>
      <h2 className="mt-1 font-display text-3xl leading-tight text-white sm:text-4xl">
        {event.titulo}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[#9aabbc] sm:text-base">
        {event.texto}
      </p>

      <div
        className={`mt-6 grid gap-3 ${twoCols ? "sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {event.opciones.map((option) => {
          const { guaranteed, risks } = summarizeOptionBranches(
            option.efectos,
            dinero,
          );
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChoose(option.id)}
              className="rounded-2xl border border-white/10 bg-[#1a222d] p-4 text-left transition hover:border-[#2f9e6b]/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="block font-semibold text-white">
                {option.label}
              </span>
              <span className="mt-3 flex flex-col gap-1.5">
                {guaranteed.map((hint) => (
                  <span
                    key={hint}
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-medium leading-snug ${toneClass(hintTone(hint))}`}
                  >
                    {hint}
                  </span>
                ))}
                {risks.map((risk, i) => (
                  <ChancePill
                    key={`${option.id}-risk-${i}`}
                    hints={risk.hints}
                    chance={risk.chance}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
