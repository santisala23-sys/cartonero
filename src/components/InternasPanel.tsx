"use client";

import { useState } from "react";
import {
  applyPesos,
  emptyScores,
  INTERNAS_QUESTIONS,
  internasMatch,
  describeInternasResult,
  type PartidoAfinidades,
} from "@/lib/elecciones";
import { partidoLabel } from "@/lib/partidos";
import type { PlayerState } from "@/lib/types";

interface InternasPanelProps {
  state: PlayerState;
  onFinish: (scores: PartidoAfinidades, won: boolean) => void;
}

export function InternasPanel({ state, onFinish }: InternasPanelProps) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<PartidoAfinidades>(emptyScores);
  const [done, setDone] = useState(false);

  const total = INTERNAS_QUESTIONS.length;
  const q = INTERNAS_QUESTIONS[index];
  const result = internasMatch(scores, state.partido);
  const partidoNombre = partidoLabel(state.partido, state.partido_nombre);

  function choose(optionId: string) {
    if (!q) return;
    const option = q.opciones.find((o) => o.id === optionId);
    if (!option) return;
    const nextScores = applyPesos(scores, option.pesos);
    setScores(nextScores);
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  if (done) {
    const final = internasMatch(scores, state.partido);
    return (
      <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
        <div
          className={`h-1 w-full rounded-full ${
            final.matched ? "bg-[#2f9e6b]" : "bg-[#c45c5c]"
          }`}
        />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8b84a]">
          Internas del partido
        </p>
        <h2 className="mt-1 font-display text-3xl italic text-white">
          {final.matched ? "Ganaste la interna" : "Perdiste la interna"}
        </h2>
        <p className="mt-2 text-sm text-[#b0bec8]">
          {describeInternasResult(
            final.matched,
            state.partido,
            state.partido_nombre,
            final.topId,
          )}
        </p>
        <p className="mt-3 text-xs text-[#7a8b9c]">
          Tu espacio: {partidoNombre}. Score propio: {final.yourScore} · Top:{" "}
          {final.topScore}
        </p>
        <ul className="mt-4 space-y-1.5">
          {final.ranking.map((row, i) => (
            <li
              key={row.id}
              className="flex justify-between rounded-lg bg-[#12161c] px-3 py-2 text-sm"
            >
              <span
                className={
                  row.id === state.partido
                    ? "font-semibold text-[#5fd4a0]"
                    : i === 0
                      ? "text-white"
                      : "text-[#9aabbc]"
                }
              >
                {row.nombre}
              </span>
              <span className="font-mono text-[#7a8b9c]">
                {row.score > 0 ? "+" : ""}
                {row.score}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
          onClick={() => onFinish(scores, final.matched)}
        >
          Seguir
        </button>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
      <p className="text-center text-[12px] font-semibold tracking-wide text-[#8a9bac]">
        Interna {String(index + 1).padStart(2, "0")} /{" "}
        {String(total).padStart(2, "0")}
      </p>
      <div className="mx-auto mt-2 h-px w-16 bg-white/15" />
      <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8b84a]">
        Votación del partido · {partidoNombre}
      </p>
      <h2 className="mt-3 text-center font-display text-xl leading-snug text-white sm:text-2xl">
        {q?.texto}
      </h2>
      <p className="mt-2 text-center text-sm text-[#9aabbc]">
        ¿Qué decís? Tenés que sonar a tu espacio.
      </p>
      <div className="mt-5 space-y-2">
        {q?.opciones.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => choose(opt.id)}
            className="w-full rounded-xl border border-white/10 bg-[#12161c] px-4 py-3.5 text-left text-[14px] font-medium text-[#e8eef5] transition hover:border-[#e8b84a]/40 hover:bg-[#151b24]"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </article>
  );
}
