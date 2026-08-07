"use client";

import { useEffect, useState } from "react";
import { AdvanceMonthButton } from "@/components/AdvanceMonthButton";
import { BillsPanel } from "@/components/BillsPanel";
import { EventCard } from "@/components/EventCard";
import { JobPanel } from "@/components/JobPanel";
import { MoneyDisplay } from "@/components/MoneyDisplay";
import { MonthSummaryPanel } from "@/components/MonthSummaryPanel";
import { SkillsPanel } from "@/components/SkillsPanel";
import { StartScreen } from "@/components/StartScreen";
import { StatusBar } from "@/components/StatusBar";
import { getActiveEvent } from "@/lib/game-engine";
import { useGameStore } from "@/lib/store";

export function GameShell() {
  const hydrated = useGameStore((s) => s.hydrated);
  const state = useGameStore((s) => s.state);
  const hydrate = useGameStore((s) => s.hydrate);
  const advance = useGameStore((s) => s.advance);
  const choose = useGameStore((s) => s.choose);
  const confirmBills = useGameStore((s) => s.confirmBills);
  const dismissSummary = useGameStore((s) => s.dismissSummary);
  const switchJob = useGameStore((s) => s.switchJob);
  const enroll = useGameStore((s) => s.enroll);
  const reset = useGameStore((s) => s.reset);

  const [showTitle, setShowTitle] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#2a241c] text-[#a89880]">
        Cargando…
      </div>
    );
  }

  const hasSave =
    state.mes > 1 ||
    state.dinero > 0 ||
    state.deuda > 0 ||
    state.credenciales.length > 0 ||
    state.acv_count > 0 ||
    Boolean(state.active_event_id) ||
    Boolean(state.pending_bills) ||
    state.game_over;

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

  const activeEvent = getActiveEvent(state);
  const payingBills = Boolean(state.pending_bills?.length);
  const showingSummary = Boolean(state.pending_month_summary);
  const blocked =
    Boolean(activeEvent) || payingBills || showingSummary || state.game_over;

  return (
    <div className="game-shell relative min-h-dvh">
      <div className="pointer-events-none absolute inset-0 noise-overlay" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <header className="mb-6">
          <p className="font-display text-4xl tracking-tight text-stone-950 sm:text-5xl">
            Cartonero
          </p>
          <p className="mt-1 max-w-md text-sm text-stone-600">
            del barro a la Rosada. El mes no perdona.
          </p>
        </header>

        <div className="mb-5 rounded-sm border border-stone-800/10 bg-white/55 px-4 py-4 backdrop-blur-sm sm:px-5">
          <MoneyDisplay state={state} />
          <div className="mt-4">
            <StatusBar
              salud={state.salud}
              estres={state.estres}
              bienestar={state.bienestar}
              capital_social={state.capital_social}
            />
          </div>
        </div>

        <main className="flex flex-1 flex-col justify-center py-4">
          {payingBills ? (
            <BillsPanel
              key={`bills-${state.mes}`}
              state={state}
              onConfirm={confirmBills}
            />
          ) : showingSummary ? (
            <MonthSummaryPanel
              key={`summary-${state.mes}`}
              state={state}
              onContinue={dismissSummary}
            />
          ) : state.game_over ? (
            <div className="mx-auto max-w-xl text-center">
              <h2
                className={`font-display text-3xl ${
                  state.game_over_kind === "victoria"
                    ? "text-teal-900"
                    : "text-red-800"
                }`}
              >
                {state.game_over_kind === "victoria"
                  ? "Lo lograste"
                  : "Fin del camino"}
              </h2>
              <p className="mt-3 text-stone-700">{state.game_over_reason}</p>
              <p className="mt-2 font-mono text-xs text-stone-500">
                Mes {state.mes}
                {state.acv_count > 0
                  ? ` · ACVs sobrevividos: ${state.acv_count}`
                  : null}
              </p>
              <button
                type="button"
                className="advance-btn mt-8"
                onClick={() => {
                  reset();
                  setShowTitle(true);
                }}
              >
                Empezar de nuevo
              </button>
            </div>
          ) : activeEvent ? (
            <EventCard
              event={activeEvent}
              onChoose={choose}
              dinero={state.dinero}
            />
          ) : (
            <div className="mx-auto max-w-md text-center">
              <p className="font-display text-xl text-stone-800 sm:text-2xl">
                Otro mes en la ciudad
              </p>
              <p className="mt-2 text-sm text-stone-600">
                Cobrá el sueldo, elegí qué cuentas pagar y enfrentá lo que venga.
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

        {!state.game_over ? (
          <footer className="mt-auto border-t border-stone-800/10 pt-5">
            {activeEvent || payingBills || showingSummary ? (
              <AdvanceMonthButton
                onClick={advance}
                disabled
                blockedByEvent
              />
            ) : null}
            <JobPanel
              state={state}
              onSwitchJob={switchJob}
              locked={blocked}
            />
            <SkillsPanel
              state={state}
              onEnroll={enroll}
              locked={blocked}
            />
            <button
              type="button"
              onClick={() => {
                reset();
                setShowTitle(true);
              }}
              className="mt-4 text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline"
            >
              Reiniciar partida
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
