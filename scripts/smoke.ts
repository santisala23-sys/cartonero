import {
  advanceMonth,
  applyChoice,
  createInitialState,
  getActiveEvent,
} from "../src/lib/game-engine";
import { getEligibleJobs } from "../src/lib/jobs";

let s = createInitialState();
console.log("init", s.dinero, s.trabajo_actual.titulo, s.salud);

s = advanceMonth(s);
console.log("after month", s.mes, s.dinero, s.active_event_id, s.estres);

const ev = getActiveEvent(s);
console.log("event", ev?.titulo);
if (!ev) throw new Error("Expected an event after advanceMonth");

s = applyChoice(s, ev.opciones[0].id);
console.log("after choice", {
  dinero: s.dinero,
  salud: s.salud,
  active: s.active_event_id,
});

s = { ...s, estres: 85, active_event_id: null };
s = advanceMonth(s);
console.log("high stress event", s.active_event_id);

console.log(
  "eligible jobs",
  getEligibleJobs(s).map((j) => j.id),
);
console.log("SMOKE_OK");
