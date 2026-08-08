"use client";

import { useState } from "react";
import {
  INFLUENCIA_CREAR_PARTIDO,
  INFLUENCIA_UNIRSE_PARTIDO,
  PARTIDOS,
  type PartidoId,
} from "@/lib/partidos";
import type { PlayerState } from "@/lib/types";

interface PartyPanelProps {
  state: PlayerState;
  mode: "join" | "create";
  onChoose: (partidoId: PartidoId | "skip", nombrePropio?: string) => void;
}

export function PartyPanel({ state, mode, onChoose }: PartyPanelProps) {
  const [nombre, setNombre] = useState("");
  const canCreate = state.influencia >= INFLUENCIA_CREAR_PARTIDO;
  const title =
    mode === "join"
      ? "Entrás a la política de verdad"
      : "Ya tenés peso: armá tu espacio";
  const subtitle =
    mode === "join"
      ? `Con ${INFLUENCIA_UNIRSE_PARTIDO}+ de influencia te abren la puerta de un partido. Elegí bandera.`
      : `Con ${INFLUENCIA_CREAR_PARTIDO}+ podés crear el tuyo o cambiar de estructura.`;

  return (
    <article className="mx-auto w-full max-w-xl animate-in rounded-2xl bg-[#1a222d] p-5 text-[#e8eef5]">
      <div className="h-1 w-full rounded-full bg-[#c45c5c]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e57373]">
        Partido · influencia {Math.round(state.influencia)}
      </p>
      <h2 className="mt-1 font-display text-3xl italic text-white">{title}</h2>
      <p className="mt-2 text-sm text-[#b0bec8]">{subtitle}</p>
      {state.partido ? (
        <p className="mt-2 text-xs text-[#7a8b9c]">
          Ahora: {state.partido_nombre ?? state.partido}
        </p>
      ) : null}

      <div className="mt-5 space-y-2">
        {PARTIDOS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="w-full rounded-xl border border-white/10 bg-[#12161c] px-4 py-3 text-left transition hover:border-[#3d9b6a]/50 hover:bg-[#151b24]"
            onClick={() => onChoose(p.id)}
          >
            <p className="font-semibold text-white">{p.nombre}</p>
            <p className="mt-0.5 text-xs text-[#9aabbc]">{p.descripcion}</p>
          </button>
        ))}
      </div>

      {canCreate ? (
        <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-amber-100">
            Crear tu propio partido
          </p>
          <p className="mt-1 text-xs text-[#9aabbc]">
            Nombre, color y narrativa: tu espacio. Las coimas van al negro.
          </p>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={40}
            placeholder="Ej: Frente del Barrio"
            className="mt-3 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#3d9b6a]"
          />
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[#c9a227] px-4 py-3 text-sm font-black uppercase tracking-wide text-[#1a1508]"
            onClick={() => onChoose("propio", nombre)}
          >
            Fundar espacio propio
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-[#9aabbc]"
        onClick={() => onChoose("skip")}
      >
        Todavía no
      </button>
    </article>
  );
}
