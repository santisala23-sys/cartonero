"use client";

import {
  hintTone,
  summarizeEffects,
  toneClassLight,
} from "@/lib/effect-summary";
import type { GameEvent } from "@/lib/types";

interface EventCardProps {
  event: GameEvent;
  onChoose: (optionId: string) => void;
  disabled?: boolean;
  dinero?: number;
}

export function EventCard({
  event,
  onChoose,
  disabled,
  dinero = 0,
}: EventCardProps) {
  return (
    <article className="event-card animate-in mx-auto w-full max-w-xl">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-900/70">
        Evento
      </p>
      <h2 className="font-display text-2xl leading-tight text-stone-950 sm:text-3xl">
        {event.titulo}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-stone-700 sm:text-lg">
        {event.texto}
      </p>
      <div className="mt-8 flex flex-col gap-2.5">
        {event.opciones.map((option) => {
          const hints = summarizeEffects(option.efectos, dinero);
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChoose(option.id)}
              className="option-btn text-left"
            >
              <span className="block font-medium text-stone-900">
                {option.label}
              </span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                {hints.map((hint) => (
                  <span
                    key={hint}
                    className={`inline-block rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-snug ${toneClassLight(hintTone(hint))}`}
                  >
                    {hint}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
