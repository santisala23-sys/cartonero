"use client";

import { useState } from "react";
import {
  BALLOTAGE_PUNTOS_GANAR,
  BALLOTAGE_QUESTIONS,
  ballotageWon,
} from "@/lib/elecciones";

interface BallotagePanelProps {
  onFinish: (puntos: number, won: boolean) => void;
}

export function BallotagePanel({ onFinish }: BallotagePanelProps) {
  const [index, setIndex] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [done, setDone] = useState(false);
  const [lastHint, setLastHint] = useState<string | null>(null);

  const total = BALLOTAGE_QUESTIONS.length;
  const q = BALLOTAGE_QUESTIONS[index];
  const won = ballotageWon(puntos);

  function choose(optionId: string) {
    if (!q) return;
    const option = q.opciones.find((o) => o.id === optionId);
    if (!option) return;
    const gain = option.puntos ?? 0;
    const nextPts = puntos + gain;
    setPuntos(nextPts);
    setLastHint(
      gain >= 3
        ? "La cámara te amó."
        : gain >= 2
          ? "Pasable. El rival anotó igual."
          : gain >= 1
            ? "Flojo. El hashtag no te ayuda."
            : "Se te cayó la estantería en vivo.",
    );
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  if (done) {
    const victory = ballotageWon(puntos);
    return (
      <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
        <div
          className={`h-1 w-full rounded-full ${
            victory ? "bg-[#2f9e6b]" : "bg-[#c45c5c]"
          }`}
        />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7ec8ff]">
          Ballotage · en vivo
        </p>
        <h2 className="mt-1 font-display text-3xl italic text-white">
          {victory ? "Ganaste el ballotage" : "Perdiste el ballotage"}
        </h2>
        <p className="mt-2 text-sm text-[#b0bec8]">
          {victory
            ? "Las respuestas cerraron. El país te compró el cierre. La noche es tuya."
            : `No llegaste a ${BALLOTAGE_PUNTOS_GANAR} puntos de debate. El rival se quedó con el relato.`}
        </p>
        <p className="mt-3 font-mono text-sm text-[#9aabbc]">
          Puntos: {puntos}/{BALLOTAGE_PUNTOS_GANAR} para ganar
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
          onClick={() => onFinish(puntos, victory)}
        >
          Seguir
        </button>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#0f1419] p-5 text-[#e8eef5] ring-1 ring-[#7ec8ff]/20">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7ec8ff]">
          ● En vivo
        </p>
        <p className="font-mono text-xs text-[#8a9bac]">
          {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")} ·{" "}
          {puntos} pts
        </p>
      </div>
      <div className="mx-auto mt-3 h-px w-full bg-gradient-to-r from-transparent via-[#7ec8ff]/40 to-transparent" />
      <h2 className="mt-5 text-center font-display text-xl leading-snug text-white sm:text-2xl">
        {q?.texto}
      </h2>
      <p className="mt-2 text-center text-sm text-[#9aabbc]">
        Elegí qué decís. Hay respuestas que cierran y otras que te funden.
      </p>
      {lastHint ? (
        <p className="mt-3 text-center text-xs text-[#e8b84a]">{lastHint}</p>
      ) : null}
      <div className="mt-5 space-y-2">
        {q?.opciones.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => choose(opt.id)}
            className="w-full rounded-xl border border-white/10 bg-[#151b24] px-4 py-3.5 text-left text-[14px] font-medium text-[#e8eef5] transition hover:border-[#7ec8ff]/50 hover:bg-[#1a222d]"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </article>
  );
}
