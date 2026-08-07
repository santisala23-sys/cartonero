import { advanceMonth, createInitialState } from "../src/lib/game-engine";
import { estimateMonthlyCosts, listMonthlyCosts } from "../src/lib/monthly-costs";

let s = createInitialState();
console.log(
  "cartonero costs",
  estimateMonthlyCosts(s),
  listMonthlyCosts(s).map((l) => l.label + ":" + l.amount),
);

s = advanceMonth(s);
console.log("after month 1", {
  dinero: s.dinero,
  deuda: s.deuda,
  ledger: s.last_month_ledger,
  estres: s.estres,
});

s = {
  ...s,
  estres: 95,
  active_event_id: null,
  last_event_id: s.active_event_id,
};
s = advanceMonth(s);
console.log("high stress month", {
  deuda: s.deuda,
  lines: s.last_month_ledger?.lines.map((l) => l.id),
  flags: s.flags.filter((f) => f === "en_terapia"),
  estres: s.estres,
});

if (!s.last_month_ledger?.lines.some((l) => l.id === "psicologo")) {
  throw new Error("expected psychologist cost at stress > 90");
}

console.log("COSTS_OK");
