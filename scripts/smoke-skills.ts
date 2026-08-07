import {
  advanceMonth,
  continueFromJob,
  continueFromTraining,
  createInitialState,
  createProfile,
  dismissMonthSummary,
  resolveBills,
  startCredential,
} from "../src/lib/game-engine";
import { CREDENTIALS } from "../src/lib/credentials";
import { JOBS, getEligibleJobs } from "../src/lib/jobs";

console.log("creds", CREDENTIALS.length, "jobs", JOBS.length);

let s = createProfile(createInitialState(), "Toli", 3);
s = advanceMonth(s);
s = { ...s, dinero: 500000 };
s = startCredential(s, "primaria");
if (!s.credenciales.includes("primaria")) throw new Error("primaria failed");
s = startCredential(s, "curso_cocina_basica");
if (s.estudios_en_curso.length !== 1) throw new Error("should be studying");
s = continueFromTraining(s);
s = continueFromJob(s);
const decisions: Record<string, "pay" | "skip"> = {};
for (const bill of s.pending_bills ?? []) decisions[bill.id] = "pay";
s = resolveBills(s, decisions);
if (!s.credenciales.includes("curso_cocina_basica")) {
  throw new Error("cuisine course should complete in 1 month");
}
s = dismissMonthSummary(s);
s = { ...s, active_event_id: null };
const elig = getEligibleJobs(s).map((j) => j.id);
if (!elig.includes("ayudante_cocina")) {
  throw new Error("ayudante_cocina should unlock");
}
console.log("SKILLS_OK");
