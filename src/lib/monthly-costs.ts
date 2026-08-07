import {
  bonusForPaidBill,
  consequenceForSkippedBill,
  type MonthStoryBeat,
} from "@/lib/bill-consequences";
import { applyMoneySpend, clampMetrics, payDebt } from "@/lib/effects";
import type { MetricKey, PlayerState } from "@/lib/types";

export type MetricDelta = Partial<Record<MetricKey, number>>;

export interface CostLine {
  id: string;
  label: string;
  amount: number;
  /** Applied when you pay this bill. */
  al_pagar: MetricDelta;
  /** Applied when you skip paying. */
  al_saltear: MetricDelta;
}

export interface MonthLedgerLine extends CostLine {
  pagado: boolean;
}

export interface MonthLedger {
  sueldo: number;
  lines: MonthLedgerLine[];
  total_gastos: number;
  total_salteado: number;
  neto: number;
  historias: MonthStoryBeat[];
  estudios_completados: string[];
  interes_deuda: number;
  pago_deuda: number;
  balance_historias: number;
}

function has(state: PlayerState, flag: string): boolean {
  return state.flags.includes(flag);
}

function line(
  id: string,
  label: string,
  amount: number,
  al_pagar: MetricDelta,
  al_saltear: MetricDelta,
): CostLine {
  return { id, label, amount, al_pagar, al_saltear };
}

/** Baseline cost of living — always on. Scales with income bracket. */
function baseServiceCosts(state: PlayerState): CostLine[] {
  const sueldo = state.trabajo_actual.sueldo;

  if (sueldo < 100000) {
    return [
      line(
        "alquiler",
        "Pieza / techo",
        12000,
        { bienestar: 4, estres: -2 },
        { bienestar: -12, estres: 10, capital_social: -6, salud: -3 },
      ),
      line(
        "servicios",
        "Luz / agua",
        8000,
        { bienestar: 3, estres: -1 },
        { bienestar: -8, estres: 8, salud: -4 },
      ),
      line(
        "celular",
        "Celular / datos",
        5000,
        { capital_social: 2, estres: -1 },
        { capital_social: -8, estres: 6, bienestar: -4 },
      ),
      line(
        "comida",
        "Comida básica",
        22000,
        { salud: 6, bienestar: 5, estres: -2 },
        { salud: -14, bienestar: -12, estres: 10 },
      ),
      line(
        "transporte",
        "Bondi / SUBE",
        4000,
        { estres: -2, bienestar: 2 },
        { estres: 8, salud: -3, bienestar: -5, capital_social: -2 },
      ),
    ];
  }

  if (sueldo < 400000) {
    return [
      line(
        "alquiler",
        "Alquiler",
        70000,
        { bienestar: 6, estres: -3, capital_social: 2 },
        { bienestar: -14, estres: 12, capital_social: -10, salud: -4 },
      ),
      line(
        "luz",
        "Luz",
        has(state, "tiene_aire") ? 25000 : 14000,
        { bienestar: 4, estres: -2 },
        { bienestar: -10, estres: 9, salud: -3 },
      ),
      line(
        "agua_gas",
        "Agua y gas",
        10000,
        { bienestar: 3, salud: 2 },
        { bienestar: -7, salud: -5, estres: 6 },
      ),
      line(
        "celular",
        "Celular / datos",
        12000,
        { capital_social: 3, estres: -1 },
        { capital_social: -10, estres: 7, bienestar: -5 },
      ),
      line(
        "comida",
        "Comida",
        50000,
        { salud: 8, bienestar: 6, estres: -3 },
        { salud: -16, bienestar: -14, estres: 12 },
      ),
      line(
        "transporte",
        "Transporte",
        12000,
        { estres: -3, bienestar: 3 },
        { estres: 10, salud: -4, bienestar: -6 },
      ),
    ];
  }

  return [
    line(
      "alquiler",
      "Alquiler / expensas",
      150000,
      { bienestar: 8, estres: -4, capital_social: 3 },
      { bienestar: -16, estres: 14, capital_social: -12, salud: -5 },
    ),
    line(
      "luz",
      "Luz",
      has(state, "tiene_aire") ? 40000 : 22000,
      { bienestar: 5, estres: -2 },
      { bienestar: -12, estres: 10, salud: -4 },
    ),
    line(
      "agua_gas",
      "Agua y gas",
      18000,
      { bienestar: 4, salud: 2 },
      { bienestar: -8, salud: -6, estres: 7 },
    ),
    line(
      "celular",
      "Celular / fibra",
      20000,
      { capital_social: 4, estres: -2 },
      { capital_social: -12, estres: 8, bienestar: -6 },
    ),
    line(
      "comida",
      "Comida",
      90000,
      { salud: 10, bienestar: 8, estres: -4 },
      { salud: -18, bienestar: -16, estres: 14 },
    ),
    line(
      "transporte",
      "Transporte / Uber",
      35000,
      { estres: -4, bienestar: 4, capital_social: 2 },
      { estres: 12, salud: -5, bienestar: -8, capital_social: -4 },
    ),
  ];
}

function conditionalCosts(state: PlayerState): CostLine[] {
  const lines: CostLine[] = [];

  if (!has(state, "sin_prepaga") && state.trabajo_actual.sueldo >= 100000) {
    lines.push(
      line(
        "prepaga",
        "Prepaga / salud",
        45000,
        { salud: 8, estres: -4, bienestar: 4 },
        { salud: -12, estres: 10, bienestar: -8 },
      ),
    );
  }

  if (has(state, "gym_member")) {
    lines.push(
      line(
        "gym",
        "Gym",
        22000,
        { salud: 6, estres: -5, bienestar: 4 },
        { salud: -4, estres: 4, bienestar: -6, capital_social: -2 },
      ),
    );
  }

  if (has(state, "tiene_perro")) {
    lines.push(
      line(
        "perro",
        "Comida / vet perro",
        18000,
        { bienestar: 8, estres: -3 },
        { bienestar: -14, estres: 10, capital_social: -4, salud: -2 },
      ),
    );
  }

  if (has(state, "cuotas_multa")) {
    lines.push(
      line(
        "cuotas_multa",
        "Cuota multa",
        15000,
        { estres: -4, capital_social: 2 },
        { estres: 12, capital_social: -8, bienestar: -6 },
      ),
    );
  }

  if (state.hijos > 0) {
    lines.push(
      line(
        "hijos",
        state.hijos === 1 ? "Gastos del hijo" : `Gastos de ${state.hijos} hijos`,
        28000 * state.hijos,
        { bienestar: 4, estres: -2 },
        { bienestar: -12, estres: 10, capital_social: -6, salud: -3 },
      ),
    );
  }

  if (state.estres > 90 || has(state, "en_terapia")) {
    lines.push(
      line(
        "psicologo",
        state.estres > 90
          ? "Psicólogo (estrés crítico)"
          : "Psicólogo (sesiones)",
        40000,
        { estres: -18, bienestar: 8, salud: 3 },
        { estres: 14, bienestar: -12, salud: -6, capital_social: -3 },
      ),
    );
  }

  if (state.deuda > 0) {
    lines.push(
      line(
        "pago_deuda",
        "Pagar la deuda",
        state.deuda,
        { estres: -5, bienestar: 4 },
        {},
      ),
    );
  }

  return lines;
}

export function listMonthlyCosts(state: PlayerState): CostLine[] {
  return [...baseServiceCosts(state), ...conditionalCosts(state)];
}

export function estimateMonthlyCosts(state: PlayerState): number {
  return listMonthlyCosts(state)
    .filter((row) => row.id !== "pago_deuda")
    .reduce((sum, row) => sum + row.amount, 0);
}

function applyMetricDelta(
  state: PlayerState,
  delta: MetricDelta,
): PlayerState {
  let next = { ...state };
  for (const [key, value] of Object.entries(delta) as [MetricKey, number][]) {
    if (value === undefined) continue;
    next = { ...next, [key]: next[key] + value };
  }
  return next;
}

export function formatMetricDelta(delta: MetricDelta): string[] {
  const labels: Record<MetricKey, string> = {
    salud: "Salud",
    estres: "Estrés",
    bienestar: "Bienestar",
    capital_social: "Capital social",
    influencia: "Influencia",
  };
  return (Object.keys(labels) as MetricKey[])
    .filter((k) => delta[k] !== undefined && delta[k] !== 0)
    .map((k) => {
      const v = delta[k]!;
      if (k === "estres") {
        return v < 0 ? `−${Math.abs(v)} Estrés` : `+${v} Estrés`;
      }
      return `${v > 0 ? "+" : ""}${v} ${labels[k]}`;
    });
}

function applyStoryBeat(
  state: PlayerState,
  beat: MonthStoryBeat,
): PlayerState {
  let next = applyMetricDelta(state, beat.deltas);
  if (beat.dinero < 0) {
    next = applyMoneySpend(next, -beat.dinero);
  } else if (beat.dinero > 0) {
    next = { ...next, dinero: next.dinero + beat.dinero };
  }
  return next;
}

/**
 * Apply player decisions for each pending bill.
 * Paying spends money (debt if short); skipping applies harsh metric hits
 * plus narrative opportunity losses.
 * Debt payment never creates more debt: it only spends cash you have.
 */
export function resolveMonthlyBills(
  state: PlayerState,
  decisions: Record<string, "pay" | "skip">,
): { state: PlayerState; ledger: MonthLedger } {
  const bills = state.pending_bills ?? listMonthlyCosts(state);
  let next = { ...state };

  if (next.estres > 90 && !next.flags.includes("en_terapia")) {
    next = { ...next, flags: [...next.flags, "en_terapia"] };
  }

  const ledgerLines: MonthLedgerLine[] = [];
  const historias: MonthStoryBeat[] = [
    ...((state.last_month_ledger?.historias as MonthStoryBeat[] | undefined) ??
      []),
  ];
  let totalPaid = 0;
  let totalSkipped = 0;
  let balanceHistorias = state.last_month_ledger?.balance_historias ?? 0;
  let pagoDeuda = 0;

  const regularBills = bills.filter((b) => b.id !== "pago_deuda");
  const debtBill = bills.find((b) => b.id === "pago_deuda");
  const payingDebt = debtBill
    ? (decisions[debtBill.id] ?? "skip") === "pay"
    : false;

  // 1) Pay regular services first.
  for (const bill of regularBills) {
    const choice = decisions[bill.id] ?? "pay";
    if (choice === "pay") {
      next = applyMoneySpend(next, bill.amount);
      next = applyMetricDelta(next, bill.al_pagar);
      totalPaid += bill.amount;
      ledgerLines.push({ ...bill, pagado: true });
      const bonus = bonusForPaidBill(bill.id, next);
      if (bonus) {
        next = applyStoryBeat(next, bonus);
        historias.push(bonus);
        balanceHistorias += bonus.dinero;
      }
    }
  }

  // 2) Intentional debt payment uses remaining cash (never creates more debt).
  if (debtBill && payingDebt) {
    const beforeDebt = next.deuda;
    const beforeCash = next.dinero;
    next = payDebt(next, "all");
    const paid = Math.min(beforeDebt, beforeCash - next.dinero);
    pagoDeuda += paid;
    if (paid > 0) {
      next = applyMetricDelta(next, debtBill.al_pagar);
    }
    ledgerLines.push({
      ...debtBill,
      amount: paid > 0 ? paid : debtBill.amount,
      pagado: paid > 0,
    });
  } else if (debtBill) {
    ledgerLines.push({ ...debtBill, pagado: false });
    totalSkipped += debtBill.amount;
  }

  // 3) Skipped services — penalties after debt payment so they don't eat the abono.
  for (const bill of regularBills) {
    const choice = decisions[bill.id] ?? "pay";
    if (choice === "pay") continue;
    next = applyMetricDelta(next, bill.al_saltear);
    totalSkipped += bill.amount;
    ledgerLines.push({ ...bill, pagado: false });
    const hit = consequenceForSkippedBill(bill.id, next);
    if (hit) {
      next = applyStoryBeat(next, hit);
      historias.push(hit);
      balanceHistorias += hit.dinero;
    }
  }

  if (next.flags.includes("canos_rotos")) {
    next = {
      ...next,
      bienestar: next.bienestar - 4,
      estres: next.estres + 2,
    };
  }

  // Leftover cash after bills goes to debt automatically.
  if (next.deuda > 0 && next.dinero > 0) {
    const beforeDebt = next.deuda;
    const beforeCash = next.dinero;
    next = payDebt(next, "all");
    pagoDeuda += Math.min(beforeDebt, beforeCash - next.dinero);
  }

  if (pagoDeuda > 0) {
    next = {
      ...next,
      estres: next.estres - Math.min(6, 2 + Math.floor(pagoDeuda / 100000)),
      bienestar: next.bienestar + 2,
    };
  }

  const sueldo = state.last_month_ledger?.sueldo ?? state.trabajo_actual.sueldo;
  const ledger: MonthLedger = {
    sueldo,
    lines: ledgerLines,
    total_gastos: totalPaid,
    total_salteado: totalSkipped,
    neto: sueldo - totalPaid + balanceHistorias - pagoDeuda,
    historias,
    estudios_completados: [],
    interes_deuda: 0,
    pago_deuda: pagoDeuda,
    balance_historias: balanceHistorias,
  };

  next = {
    ...next,
    pending_bills: null,
    last_month_ledger: ledger,
  };

  return { state: clampMetrics(next), ledger };
}
