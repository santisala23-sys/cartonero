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
import { getEligibleJobs } from "../src/lib/jobs";

function finishMonth(state: ReturnType<typeof createInitialState>) {
  let s = state;
  if (s.month_phase === "idle") s = advanceMonth(s);
  if (s.month_phase === "capacitacion") s = continueFromTraining(s);
  if (s.month_phase === "trabajo") s = continueFromJob(s);
  const decisions: Record<string, "pay" | "skip"> = {};
  for (const bill of s.pending_bills ?? []) decisions[bill.id] = "pay";
  s = resolveBills(s, decisions);
  if (s.pending_month_summary) s = dismissMonthSummary(s);
  return s;
}

let s = createProfile(createInitialState(), "Toli", 3);
console.log("init", s.nombre, s.edad, s.trabajo_actual.titulo);
s = finishMonth(s);
const ev = getActiveEvent(s);
if (!ev) throw new Error("Expected an event after month summary");
s = applyChoice(s, ev.opciones[0].id);
s = { ...s, estres: 85, active_event_id: null, dinero: 500000 };
s = finishMonth(s);
console.log("SMOKE_OK", getEligibleJobs(s).length);
