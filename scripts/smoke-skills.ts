import {
  advanceMonth,
  createInitialState,
  dismissMonthSummary,
  resolveBills,
  startCredential,
} from "../src/lib/game-engine";
import { CREDENTIALS } from "../src/lib/credentials";
import { JOBS, getEligibleJobs } from "../src/lib/jobs";

console.log("creds", CREDENTIALS.length, "jobs", JOBS.length);

let s = createInitialState();
s = startCredential(s, "primaria");
if (!s.credenciales.includes("primaria")) throw new Error("primaria failed");

s = { ...s, dinero: 500000, active_event_id: null };
s = startCredential(s, "curso_cocina_basica");
if (s.estudios_en_curso.length !== 1) throw new Error("should be studying");

s = advanceMonth(s);
if (!s.pending_bills?.length) throw new Error("expected bills after advance");

const decisions: Record<string, "pay" | "skip"> = {};
for (const bill of s.pending_bills) {
  decisions[bill.id] = "pay";
}
s = resolveBills(s, decisions);
if (!s.pending_month_summary) throw new Error("expected summary");
if (!s.credenciales.includes("curso_cocina_basica")) {
  throw new Error("cuisine course should complete in 1 month");
}

s = dismissMonthSummary(s);
s = { ...s, active_event_id: null };
const elig = getEligibleJobs(s).map((j) => j.id);
if (!elig.includes("ayudante_cocina")) {
  throw new Error("ayudante_cocina should unlock");
}

console.log("eligible", elig.slice(0, 10));
console.log("SKILLS_OK");
