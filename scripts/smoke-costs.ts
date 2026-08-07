import {
  advanceMonth,
  continueFromJob,
  continueFromTraining,
  createInitialState,
  createProfile,
  dismissMonthSummary,
  resolveBills,
} from "../src/lib/game-engine";
import { estimateMonthlyCosts, listMonthlyCosts } from "../src/lib/monthly-costs";

function payAll(state: ReturnType<typeof createInitialState>) {
  let s = state;
  if (s.month_phase === "capacitacion") s = continueFromTraining(s);
  if (s.month_phase === "trabajo") s = continueFromJob(s);
  const decisions: Record<string, "pay" | "skip"> = {};
  for (const bill of s.pending_bills ?? []) decisions[bill.id] = "pay";
  s = resolveBills(s, decisions);
  s = dismissMonthSummary(s);
  return s;
}

let s = createProfile(createInitialState(), "Toli", 3);
console.log("cartonero costs", estimateMonthlyCosts(s));
s = advanceMonth(s);
s = payAll(s);
s = { ...s, estres: 95, active_event_id: null, dinero: 500000 };
s = advanceMonth(s);
s = continueFromTraining(s);
s = continueFromJob(s);
if (!s.pending_bills?.some((l) => l.id === "psicologo")) {
  throw new Error("expected psychologist cost at stress > 90");
}
s = resolveBills(
  s,
  Object.fromEntries((s.pending_bills ?? []).map((b) => [b.id, "pay" as const])),
);
s = dismissMonthSummary(s);
console.log("COSTS_OK");
