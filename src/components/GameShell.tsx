"use client";

import { useEffect, useState } from "react";
import { AdvanceMonthButton } from "@/components/AdvanceMonthButton";
import { BillsPanel } from "@/components/BillsPanel";
import { BrujulaPanel } from "@/components/BrujulaPanel";
import { CareerDashboard } from "@/components/CareerDashboard";
import { CharacterCreate } from "@/components/CharacterCreate";
import { EventCard } from "@/components/EventCard";
import { JobStep } from "@/components/JobStep";
import { MonthSummaryPanel } from "@/components/MonthSummaryPanel";
import { PartyPanel } from "@/components/PartyPanel";
import { RiskRevealPanel } from "@/components/RiskRevealPanel";
import { StartScreen } from "@/components/StartScreen";
import { TrainingStep } from "@/components/TrainingStep";
import { getActiveEvent, partyOfferMode } from "@/lib/game-engine";
import { useGameStore } from "@/lib/store";

export function GameShell() {
  const hydrated = useGameStore((s) => s.hydrated);
  const state = useGameStore((s) => s.state);
  const hydrate = useGameStore((s) => s.hydrate);
  const createCharacter = useGameStore((s) => s.createCharacter);
  const advance = useGameStore((s) => s.advance);
  const choose = useGameStore((s) => s.choose);
  const confirmBills = useGameStore((s) => s.confirmBills);
  const dismissSummary = useGameStore((s) => s.dismissSummary);
  const dismissRiskReveal = useGameStore((s) => s.dismissRiskReveal);
  const pickTraining = useGameStore((s) => s.pickTraining);
  const pickJob = useGameStore((s) => s.pickJob);
  const chooseParty = useGameStore((s) => s.chooseParty);
  const finishBrujula = useGameStore((s) => s.finishBrujula);
  const reset = useGameStore((s) => s.reset);

  const [showTitle, setShowTitle] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#12161c] text-[#8a9bac]">
        Cargando…
      </div>
    );
  }

  const hasSave = state.perfil_creado;

  if (showTitle) {
    return (
      <StartScreen
        hasSave={hasSave}
        onStart={() => setShowTitle(false)}
        onNewGame={() => {
          reset();
          setShowTitle(false);
        }}
      />
    );
  }

  if (!state.perfil_creado) {
    return (
      <CharacterCreate
        onConfirm={(nombre, mes, genero) => {
          createCharacter(nombre, mes, genero);
        }}
      />
    );
  }

  const activeEvent = getActiveEvent(state);
  const phase = state.month_phase;
  const inTraining = phase === "capacitacion";
  const inJob = phase === "trabajo";
  const payingBills =
    phase === "cuentas" && Boolean(state.pending_bills?.length);
  const showingSummary = Boolean(state.pending_month_summary);
  const showingRiskReveal = Boolean(state.pending_risk_reveal);
  const inParty = phase === "partido";
  const inBrujula = phase === "brujula";
  const partyMode = inParty ? partyOfferMode(state) : "none";
  const midMonth =
    inTraining ||
    inJob ||
    payingBills ||
    showingRiskReveal ||
    showingSummary ||
    inBrujula ||
    inParty;
  const blocked = Boolean(activeEvent) || midMonth || state.game_over;

  function startNewGame() {
    reset();
    setShowTitle(true);
  }

  return (
    <div className="relative min-h-dvh bg-[#0d1117]">
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 py-4 sm:px-5 sm:py-6">
        <header className="mb-4 flex items-baseline justify-between gap-3 px-1">
          <p className="font-display text-2xl tracking-tight text-white sm:text-3xl">
            Cartonero
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b7c8f]">
            del barro a la Rosada
          </p>
        </header>

        <CareerDashboard state={state} />

        <main className="flex flex-1 flex-col justify-center py-5">
          {inTraining ? (
            <TrainingStep
              key={`train-${state.mes}`}
              state={state}
              onPick={pickTraining}
            />
          ) : inJob ? (
            <JobStep
              key={`job-${state.mes}-${state.trabajo_actual.id}`}
              state={state}
              onPick={pickJob}
            />
          ) : payingBills ? (
            <BillsPanel
              key={`bills-${state.mes}`}
              state={state}
              onConfirm={confirmBills}
            />
          ) : activeEvent ? (
            <EventCard
              event={activeEvent}
              onChoose={choose}
              dinero={state.dinero}
            />
          ) : showingRiskReveal && state.pending_risk_reveal ? (
            <RiskRevealPanel
              key={`risk-${state.mes}-${state.last_event_id}`}
              reveal={state.pending_risk_reveal}
              onContinue={dismissRiskReveal}
            />
          ) : showingSummary ? (
            <MonthSummaryPanel
              key={`summary-${state.mes}`}
              state={state}
              onContinue={dismissSummary}
            />
          ) : inBrujula ? (
            <BrujulaPanel
              key={`brujula-${state.mes}`}
              onFinish={finishBrujula}
            />
          ) : inParty && partyMode !== "none" ? (
            <PartyPanel
              key={`party-${state.mes}`}
              state={state}
              mode={partyMode}
              onChoose={chooseParty}
            />
          ) : state.game_over ? (
            <div className="mx-auto max-w-xl rounded-2xl bg-[#1a222d] px-5 py-8 text-center text-[#e8eef5]">
              <h2
                className={`font-display text-3xl ${
                  state.game_over_kind === "victoria"
                    ? "text-[#5fd4a0]"
                    : "text-[#e57373]"
                }`}
              >
                {state.game_over_kind === "victoria"
                  ? "Lo lograste"
                  : "Fin del camino"}
              </h2>
              <p className="mt-3 text-[#b0bec8]">{state.game_over_reason}</p>
              <p className="mt-2 font-mono text-xs text-[#7a8b9c]">
                {state.nombre} · {state.edad} años · mes {state.mes}
                {state.acv_count > 0 ? ` · ACVs ${state.acv_count}/4` : ""}
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl bg-[#1a222d] px-5 py-8 text-center text-[#e8eef5]">
              <p className="font-display text-xl text-white sm:text-2xl">
                Otro trimestre, {state.nombre}
              </p>
              <p className="mt-2 text-sm text-[#9aabbc]">
                Cobrá, capacitáte, mirá laburos y pagá las cuentas. El calendario
                avanza tres meses.
              </p>
              <div className="mt-8">
                <AdvanceMonthButton
                  onClick={advance}
                  disabled={blocked}
                  blockedByEvent={false}
                />
              </div>
            </div>
          )}
        </main>

        <footer className="mt-auto border-t border-white/10 pt-5">
          {state.game_over ? (
            <button
              type="button"
              className="w-full rounded-xl bg-[#2f9e6b] px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white"
              onClick={startNewGame}
            >
              Empezar una nueva partida
            </button>
          ) : (
            <>
              {activeEvent || midMonth ? (
                <AdvanceMonthButton onClick={advance} disabled blockedByEvent />
              ) : null}
              <button
                type="button"
                onClick={startNewGame}
                className="mt-4 text-xs text-[#6b7c8f] underline-offset-2 hover:text-[#9aabbc] hover:underline"
              >
                Reiniciar partida
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
