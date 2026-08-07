"use client";

import { useState } from "react";
import { MESES_NOMBRE } from "@/lib/identity";
import type { Genero } from "@/lib/types";

interface CharacterCreateProps {
  onConfirm: (nombre: string, mesNacimiento: number, genero: Genero) => void;
}

export function CharacterCreate({ onConfirm }: CharacterCreateProps) {
  const [nombre, setNombre] = useState("");
  const [mes, setMes] = useState(3);
  const [genero, setGenero] = useState<Genero>("hombre");

  const ready = nombre.trim().length >= 2;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[#12161c] px-4 py-10 text-[#e8eef5]">
      <div className="w-full max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6b7c8f]">
          Tu carrera empieza acá
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">¿Quién sos?</h1>
        <p className="mt-2 text-sm text-[#9aabbc]">
          Nombre, género y mes de cumpleaños. Arrancás cartonero, en la villa,
          sin primaria.
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

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7c8f]">
          Género
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              ["hombre", "Hombre"],
              ["mujer", "Mujer"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setGenero(value)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                genero === value
                  ? "border-[#2f9e6b] bg-[#2f9e6b]/20 text-white"
                  : "border-white/10 bg-[#1a222d] text-[#9aabbc]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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
          18 años · 2026 · villa · sin estudios
        </p>

        <button
          type="button"
          disabled={!ready}
          className="mt-8 w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onConfirm(nombre.trim(), mes, genero)}
        >
          Empezar carrera
        </button>
      </div>
    </div>
  );
}
