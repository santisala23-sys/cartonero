import {
  advanceMonth,
  applyChoice,
  continueFromJob,
  continueFromTraining,
  createInitialState,
  createProfile,
  dismissMonthSummary,
  getActiveEvent,
  resolveBills,
} from "../src/lib/game-engine";
import { applyEffects } from "../src/lib/effects";
import { getDebtTier } from "../src/lib/debt";

let s = createProfile(createInitialState(), "Toli", 3);
s = applyEffects(s, [{ type: "delta", metric: "dinero", amount: -120000 }]);
if (s.deuda < 100000) throw new Error("expected debt from overspend");
s = { ...s, active_event_id: null, dinero: 500000 };
s = advanceMonth(s);
s = continueFromTraining(s);
s = continueFromJob(s);
const decisions: Record<string, "pay" | "skip"> = {};
for (const bill of s.pending_bills ?? []) decisions[bill.id] = "pay";
s = resolveBills(s, decisions);
s = dismissMonthSummary(s);
const ev = getActiveEvent(s);
if (ev) s = applyChoice(s, ev.opciones[0].id);
console.log("DEBT_OK", getDebtTier(s.deuda));
