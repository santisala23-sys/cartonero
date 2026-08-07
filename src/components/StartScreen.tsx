"use client";

import Image from "next/image";

interface StartScreenProps {
  hasSave: boolean;
  onStart: () => void;
  onNewGame: () => void;
}

export function StartScreen({ hasSave, onStart, onNewGame }: StartScreenProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#1a1612]">
      <div className="absolute inset-0">
        <Image
          src="/hero-start.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mt-auto mx-auto w-full max-w-md px-5 pb-10 pt-24 text-center">
        <p className="mx-auto max-w-sm text-base leading-relaxed text-[#e8e0d4] sm:text-lg">
          Arrancás de abajo. La vida en Argentina no perdona. ¿Hasta dónde
          llegás?
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            className="w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white"
            onClick={onStart}
          >
            {hasSave ? "Continuar partida" : "Arrancar partida"}
          </button>
          {hasSave ? (
            <button
              type="button"
              onClick={onNewGame}
              className="text-xs text-[#8a7a66] underline-offset-2 hover:text-[#c4b8a4] hover:underline"
            >
              Empezar de cero
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
