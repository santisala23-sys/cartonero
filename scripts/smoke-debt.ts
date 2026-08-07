import {
  advanceMonth,
  applyChoice,
  createInitialState,
  getActiveEvent,
} from "../src/lib/game-engine";
import { applyEffects } from "../src/lib/effects";
import { getDebtTier } from "../src/lib/debt";

let s = createInitialState();
s = applyEffects(s, [{ type: "delta", metric: "dinero", amount: -120000 }]);
console.log("after overspend", {
  dinero: s.dinero,
  deuda: s.deuda,
  tier: getDebtTier(s.deuda),
});

if (s.deuda < 100000) throw new Error("expected debt from overspend");

s = { ...s, active_event_id: null };
s = advanceMonth(s);
console.log("after month", {
  mes: s.mes,
  deuda: s.deuda,
  event: s.active_event_id,
});

const ev = getActiveEvent(s);
if (ev) {
  console.log("event", ev.titulo);
  s = applyChoice(s, ev.opciones[0].id);
  console.log("after choice", {
    deuda: s.deuda,
    dinero: s.dinero,
    game_over: s.game_over,
  });
}

console.log("DEBT_OK");
