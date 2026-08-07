"use client";

import { useState } from "react";
import { MESES_NOMBRE } from "@/lib/identity";

interface CharacterCreateProps {
  onConfirm: (nombre: string, mesNacimiento: number) => void;
}

export function CharacterCreate({ onConfirm }: CharacterCreateProps) {
  const [nombre, setNombre] = useState("");
  const [mes, setMes] = useState(3);

  const ready = nombre.trim().length >= 2;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[#12161c] px-4 py-10 text-[#e8eef5]">
      <div className="w-full max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6b7c8f]">
          Tu carrera empieza acá
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">¿Quién sos?</h1>
        <p className="mt-2 text-sm text-[#9aabbc]">
          Poné tu nombre y el mes en que cumplís. Cada año, según tu capital
          social, el cumpleaños te cambia el mes.
        </p>

        <label className="mt-8 block text-[11px] font-semibold uppercase tracking-wider text-[#6b7c8f]">
          Nombre
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={24}
            placeholder="Ej: Toli"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#1a222d] px-4 py-3 text-lg text-white outline-none ring-[#3d9b6a] placeholder:text-[#5a6a7a] focus:ring-2"
          />
        </label>

        <label className="mt-5 block text-[11px] font-semibold uppercase tracking-wider text-[#6b7c8f]">
          Mes de cumpleaños
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#1a222d] px-4 py-3 text-lg text-white outline-none ring-[#3d9b6a] focus:ring-2"
          >
            {MESES_NOMBRE.map((label, i) => (
              <option key={label} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-4 text-xs text-[#7a8b9c]">
          Arrancás con 18 años · año 2026 · cartonero
        </p>

        <button
          type="button"
          disabled={!ready}
          className="mt-8 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onConfirm(nombre.trim(), mes)}
        >
          Empezar carrera
        </button>
      </div>
    </div>
  );
}
