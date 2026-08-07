"use client";

import Image from "next/image";

interface StartScreenProps {
  hasSave: boolean;
  onStart: () => void;
  onNewGame: () => void;
}

export function StartScreen({ hasSave, onStart, onNewGame }: StartScreenProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[#2a241c]">
      <div className="relative min-h-[72dvh] w-full flex-1 sm:min-h-[78dvh]">
        <Image
          src="/hero-start.png"
          alt="Cartonero: del barro a la Rosada"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#2a241c] to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-5 pb-10 pt-4 text-center">
        <p className="font-display text-3xl tracking-tight text-[#e8e0d4] sm:text-4xl">
          Cartonero
        </p>
        <p className="mt-1 text-sm italic text-[#c4b8a4]">
          del barro a la Rosada
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#a89880]">
          Arrancás abajo. El mes no perdona. ¿Hasta dónde llegás?
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            className="advance-btn w-full"
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
