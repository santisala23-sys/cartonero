import {
  advanceMonth,
  continueFromJob,
  continueFromTraining,
  createInitialState,
  createProfile,
  dismissMonthSummary,
  resolveBills,
} from "../src/lib/game-engine";

function boot() {
  return createProfile(createInitialState(), "Toli", 3);
}

let s = boot();
s = advanceMonth(s);
if (s.month_phase !== "capacitacion") throw new Error("expected training step");
s = continueFromTraining(s);
s = continueFromJob(s);
if (!s.pending_bills?.length) throw new Error("expected pending bills");

const decisions: Record<string, "pay" | "skip"> = {};
for (const bill of s.pending_bills) {
  decisions[bill.id] = bill.id === "comida" ? "pay" : "skip";
}

s = resolveBills(s, decisions);
if (!s.pending_month_summary) throw new Error("expected month summary");
s = dismissMonthSummary(s);
console.log("BILLS_OK", s.nombre, s.edad);
