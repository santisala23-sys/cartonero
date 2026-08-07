import { checkGameOver } from "../src/lib/effects";
import { ACV_FATAL_COUNT, STRESS_STREAK_FOR_ACV } from "../src/lib/endings";
import {
  advanceMonth,
  continueFromJob,
  continueFromTraining,
  createInitialState,
  createProfile,
  dismissMonthSummary,
  resolveBills,
} from "../src/lib/game-engine";

function finishMonthMaxStress(state: ReturnType<typeof createInitialState>) {
  let s = { ...state, estres: 100, dinero: Math.max(state.dinero, 800000) };
  s = advanceMonth(s);
  s = continueFromTraining(s);
  s = continueFromJob(s);
  const decisions: Record<string, "pay" | "skip"> = {};
  for (const bill of s.pending_bills ?? []) {
    decisions[bill.id] = bill.id === "psicologo" ? "skip" : "pay";
  }
  s = resolveBills(s, decisions);
  return s;
}

let s = createProfile(createInitialState(), "Toli", 3);

for (let i = 0; i < STRESS_STREAK_FOR_ACV; i++) {
  s = finishMonthMaxStress(s);
  if (s.pending_month_summary) s = dismissMonthSummary(s);
  s = {
    ...s,
    active_event_id: null,
    game_over: false,
    game_over_kind: null,
    game_over_reason: null,
  };
}

if (s.acv_count < 1) throw new Error("expected first ACV");

while (s.acv_count < ACV_FATAL_COUNT) {
  for (let i = 0; i < STRESS_STREAK_FOR_ACV; i++) {
    s = {
      ...s,
      game_over: false,
      game_over_kind: null,
      game_over_reason: null,
    };
    s = finishMonthMaxStress(s);
    if (s.pending_month_summary) {
      s = dismissMonthSummary(s);
      s = { ...s, active_event_id: null };
    }
  }
}

s = checkGameOver(s);
if (!s.game_over || s.acv_count < ACV_FATAL_COUNT) {
  throw new Error("expected death on 4th ACV");
}

s = checkGameOver({
  ...createProfile(createInitialState(), "Toli", 3),
  dinero: 3_000_000,
  deuda: 0,
  bienestar: 70,
  salud: 70,
});
if (!s.game_over || s.game_over_kind !== "victoria") {
  throw new Error("expected money victory");
}

console.log("ENDINGS_OK");
