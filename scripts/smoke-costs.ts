import {
  advanceMonth,
  createInitialState,
  dismissMonthSummary,
  resolveBills,
} from "../src/lib/game-engine";
import { estimateMonthlyCosts, listMonthlyCosts } from "../src/lib/monthly-costs";

function payAll(state: ReturnType<typeof createInitialState>) {
  let s = state;
  const decisions: Record<string, "pay" | "skip"> = {};
  for (const bill of s.pending_bills ?? []) {
    decisions[bill.id] = "pay";
  }
  s = resolveBills(s, decisions);
  s = dismissMonthSummary(s);
  return s;
}

let s = createInitialState();
console.log(
  "cartonero costs",
  estimateMonthlyCosts(s),
  listMonthlyCosts(s).map((l) => l.label + ":" + l.amount),
);

s = advanceMonth(s);
console.log("after advance (pending bills)", {
  dinero: s.dinero,
  pending: s.pending_bills?.map((l) => l.id),
  estres: s.estres,
});
s = payAll(s);
console.log("after pay", {
  dinero: s.dinero,
  deuda: s.deuda,
  ledgerLines: s.last_month_ledger?.lines.map((l) => l.id),
});

s = {
  ...s,
  estres: 95,
  active_event_id: null,
  dinero: 500000,
};
s = advanceMonth(s);
console.log("high stress bills", {
  pending: s.pending_bills?.map((l) => l.id),
  flags: s.flags.filter((f) => f === "en_terapia"),
  estres: s.estres,
});

if (!s.pending_bills?.some((l) => l.id === "psicologo")) {
  throw new Error("expected psychologist cost at stress > 90");
}

s = payAll(s);
if (!s.last_month_ledger?.lines.some((l) => l.id === "psicologo")) {
  throw new Error("expected psychologist in ledger");
}

console.log("COSTS_OK");
