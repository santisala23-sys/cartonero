"use client";

import { useState } from "react";
import {
  applyOptionToScores,
  BRUJULA_QUESTIONS,
  emptyAfinidades,
  rankPartidos,
  topPartido,
  type PartidoAfinidades,
} from "@/lib/brujula";
import { PARTIDOS, type PartidoId } from "@/lib/partidos";

interface BrujulaPanelProps {
  onFinish: (
    scores: PartidoAfinidades,
    joinPartidoId: PartidoId | "skip",
  ) => void;
}

export function BrujulaPanel({ onFinish }: BrujulaPanelProps) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<PartidoAfinidades>(emptyAfinidades);
  const [done, setDone] = useState(false);

  const total = BRUJULA_QUESTIONS.length;
  const q = BRUJULA_QUESTIONS[index];
  const ranking = rankPartidos(scores);
  const winner = topPartido(scores);
  const winnerDef = PARTIDOS.find((p) => p.id === winner);

  function choose(optionId: string) {
    if (!q) return;
    const option = q.opciones.find((o) => o.id === optionId);
    if (!option) return;
    const nextScores = applyOptionToScores(scores, option);
    setScores(nextScores);
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  if (done) {
    return (
      <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
        <div className="h-1 w-full rounded-full bg-[#c9a227]" />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a227]">
          Brújula política · resultado
        </p>
        <h2 className="mt-1 font-display text-3xl italic text-white">
          Tus decisiones te acercaron a
        </h2>
        <p className="mt-2 text-sm text-[#b0bec8]">
          Según cómo te moviste en estos quilombos, el espacio más cerca de tu
          carrera es:
        </p>
        <p className="mt-4 font-display text-2xl text-[#5fd4a0]">
          {winnerDef?.nombre ?? winner}
        </p>
        <p className="mt-1 text-xs text-[#9aabbc]">{winnerDef?.descripcion}</p>

        <ul className="mt-5 space-y-2">
          {ranking.map((row, i) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-xl bg-[#12161c] px-3 py-2 text-sm"
            >
              <span
                className={
                  i === 0 ? "font-semibold text-white" : "text-[#9aabbc]"
                }
              >
                {i + 1}. {row.nombre}
              </span>
              <span className="font-mono tabular-nums text-[#7a8b9c]">
                {row.score > 0 ? "+" : ""}
                {row.score}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
          onClick={() => onFinish(scores, winner)}
        >
          Entrar a {winnerDef?.nombre ?? "ese espacio"}
        </button>
        <button
          type="button"
          className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-[#9aabbc]"
          onClick={() => onFinish(scores, "skip")}
        >
          Ver todos los partidos
        </button>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
      <p className="text-center text-[12px] font-semibold tracking-wide text-[#8a9bac]">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <div className="mx-auto mt-2 h-px w-16 bg-white/15" />
      <p className="mt-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
        Decisión política
      </p>
      <h2 className="mt-3 text-center font-display text-xl leading-snug text-white sm:text-2xl">
        {q?.texto}
      </h2>
      <p className="mt-3 text-center text-sm text-[#9aabbc]">
        ¿Qué hacés?
      </p>

      <div className="mt-5 space-y-2">
        {q?.opciones.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => choose(opt.id)}
            className="w-full rounded-xl border border-white/10 bg-[#12161c] px-4 py-3.5 text-left text-[15px] font-medium text-[#e8eef5] transition hover:border-[#3d9b6a]/50 hover:bg-[#151b24]"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-[10px] text-[#6b7c8f]">
        Cada elección te acerca a un espacio u otro.
      </p>
    </article>
  );
}
