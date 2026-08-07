import {
  advanceMonth,
  createInitialState,
  dismissMonthSummary,
  resolveBills,
} from "../src/lib/game-engine";

let s = createInitialState();
s = advanceMonth(s);
if (!s.pending_bills?.length) throw new Error("expected pending bills");

const decisions: Record<string, "pay" | "skip"> = {};
for (const bill of s.pending_bills) {
  decisions[bill.id] = bill.id === "comida" ? "pay" : "skip";
}

const before = {
  salud: s.salud,
  bienestar: s.bienestar,
  estres: s.estres,
  capital_social: s.capital_social,
  dinero: s.dinero,
};

s = resolveBills(s, decisions);
console.log("before", before);
console.log("after", {
  salud: s.salud,
  bienestar: s.bienestar,
  estres: s.estres,
  capital_social: s.capital_social,
  dinero: s.dinero,
  deuda: s.deuda,
  ledger: s.last_month_ledger?.lines.map((l) => `${l.id}:${l.pagado}`),
  historias: s.last_month_ledger?.historias?.map((h) => h.titulo),
  pending: s.pending_bills,
  summary: s.pending_month_summary,
});

if (s.pending_bills) throw new Error("bills should be cleared");
if (!s.pending_month_summary) throw new Error("expected month summary");
if (!s.last_month_ledger?.historias?.length) {
  throw new Error("expected narrative consequences");
}
if (s.salud >= before.salud) throw new Error("skipping bills should hurt health");
if (s.active_event_id) throw new Error("event should wait until summary dismissed");

s = dismissMonthSummary(s);
if (s.pending_month_summary) throw new Error("summary should clear");

console.log("BILLS_OK");
