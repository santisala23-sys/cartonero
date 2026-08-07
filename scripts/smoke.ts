import {
  advanceMonth,
  applyChoice,
  createInitialState,
  dismissMonthSummary,
  getActiveEvent,
  resolveBills,
} from "../src/lib/game-engine";
import { getEligibleJobs } from "../src/lib/jobs";

function finishMonth(state: ReturnType<typeof createInitialState>) {
  let s = state;
  if (!s.pending_bills?.length) throw new Error("expected bills");
  const decisions: Record<string, "pay" | "skip"> = {};
  for (const bill of s.pending_bills) {
    decisions[bill.id] = "pay";
  }
  s = resolveBills(s, decisions);
  if (!s.pending_month_summary) throw new Error("expected summary");
  s = dismissMonthSummary(s);
  return s;
}

let s = createInitialState();
console.log("init", s.dinero, s.trabajo_actual.titulo, s.salud);

s = advanceMonth(s);
console.log("after month", s.mes, s.dinero, s.active_event_id, s.estres);
s = finishMonth(s);

const ev = getActiveEvent(s);
console.log("event", ev?.titulo);
if (!ev) throw new Error("Expected an event after month summary");

s = applyChoice(s, ev.opciones[0].id);
console.log("after choice", {
  dinero: s.dinero,
  salud: s.salud,
  active: s.active_event_id,
});

s = { ...s, estres: 85, active_event_id: null, dinero: 500000 };
s = advanceMonth(s);
s = finishMonth(s);
console.log("high stress event", s.active_event_id);

console.log(
  "eligible jobs",
  getEligibleJobs(s).map((j) => j.id),
);
console.log("SMOKE_OK");
