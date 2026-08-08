"use client";

import { useState } from "react";
import {
  applyLikertToScores,
  BRUJULA_QUESTIONS,
  emptyAfinidades,
  LIKERT_OPTIONS,
  rankPartidos,
  topPartido,
  type BrujulaLikert,
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

  function answer(likert: BrujulaLikert) {
    if (!q) return;
    const nextScores = applyLikertToScores(scores, q, likert);
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
          Tu mapa salió así
        </h2>
        <p className="mt-2 text-sm text-[#b0bec8]">
          Según tus reacciones a quilombos medianamente reales, el espacio más
          cerca de tu cabeza es:
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
              <span className={i === 0 ? "font-semibold text-white" : "text-[#9aabbc]"}>
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
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#f4f1ea] p-5 text-[#1a1a1a]">
      <p className="text-center text-[12px] font-semibold tracking-wide text-[#6b6b6b]">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <div className="mx-auto mt-2 h-px w-16 bg-[#cfcfcf]" />
      <h2 className="mt-6 text-center font-display text-2xl leading-snug text-[#111] sm:text-3xl">
        {q?.texto}
      </h2>
      <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">
        ¿Qué opinás?
      </p>

      <div className="mt-6 divide-y divide-[#ddd]">
        {LIKERT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => answer(opt.id)}
            className="flex w-full items-center justify-between gap-3 py-3.5 text-left transition hover:bg-black/[0.03]"
          >
            <span className="text-[15px] font-medium text-[#222]">{opt.label}</span>
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${opt.tone}`}
              aria-hidden
            >
              {opt.emoji}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-[10px] text-[#9a9a9a]">
        Respuestas absurdas, consecuencias partidarias. Estilo Cartonero.
      </p>
    </article>
  );
}
