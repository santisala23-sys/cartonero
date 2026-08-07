import type { MetricDelta } from "@/lib/monthly-costs";
import type { PlayerState } from "@/lib/types";

export interface MonthStoryBeat {
  bill_id: string | null;
  titulo: string;
  texto: string;
  /** Money change (negative = lost opportunity / fine). */
  dinero: number;
  deltas: MetricDelta;
  tono: "malo" | "bueno" | "neutro";
}

function scale(state: PlayerState, fraction: number, floor: number): number {
  return Math.max(floor, Math.round(state.trabajo_actual.sueldo * fraction));
}

function isOfficeOrClientFacing(state: PlayerState): boolean {
  const id = state.trabajo_actual.id;
  const tags = [
    "oficina",
    "tech",
    "comercio",
    "politico",
    "servicios",
    "salud",
    "legal",
  ];
  // Rough heuristic from job id / known client-facing roles
  const clientIds = [
    "vendedor_local",
    "rider_delivery",
    "chofer_uber",
    "community_manager",
    "analista_rrhh",
    "administrativo",
    "recepcionista",
    "vendedor_calle",
    "agente_inmobiliario",
    "asesor_comercial",
    "call_center",
    "cajero_banco",
    "promotor",
  ];
  if (clientIds.some((x) => id.includes(x) || id === x)) return true;
  return tags.some((t) => id.includes(t));
}

/** Narrative hit when you skip a bill. Always fires for known bills. */
export function consequenceForSkippedBill(
  billId: string,
  state: PlayerState,
): MonthStoryBeat | null {
  const client = isOfficeOrClientFacing(state);
  const lostDeal = scale(state, 0.18, 12000);
  const lostGig = scale(state, 0.12, 8000);
  const lostBig = scale(state, 0.25, 20000);

  switch (billId) {
    case "celular":
      return {
        bill_id: billId,
        titulo: "Sin señal, sin chance",
        texto: client
          ? "No pagaste el celu. Te escribieron por una propuesta y no te ubicaron. Cuando volviste a tener datos, ya habían cerrado con otro. Perdiste guita."
          : "Sin crédito ni datos, te perdiste un laburo de última hora que te ofrecieron por WhatsApp. La plata se fue a otro.",
        dinero: -lostDeal,
        deltas: { capital_social: -6, estres: 5, bienestar: -4 },
        tono: "malo",
      };
    case "agua_gas":
    case "servicios":
      return {
        bill_id: billId,
        titulo: client ? "Te cerraron la puerta" : "Sin agua en casa",
        texto: client
          ? "Con el agua cortada olías a problema. En el edificio del cliente no te dejaron pasar. Se cayó la visita y se llevó tu capital social y la comisión."
          : "Sin agua ni gas, improvisaste todo el mes. Un conocido que iba a darte una mano se espantó y no volvió.",
        dinero: -lostGig,
        deltas: { capital_social: -8, bienestar: -5, estres: 6 },
        tono: "malo",
      };
    case "luz":
      return {
        bill_id: billId,
        titulo: "Apagón laboral",
        texto: client
          ? "Se cortó la luz en medio de una reunión / entrega. Quedaste como un amateur. Te bajaron de un proyecto y del fee."
          : "Sin luz no pudiste cargar herramientas ni el celu. Perdiste un día de laburo entero.",
        dinero: -lostGig,
        deltas: { capital_social: -5, estres: 7, bienestar: -4 },
        tono: "malo",
      };
    case "transporte":
      return {
        bill_id: billId,
        titulo: "Llegaste tarde… o no llegaste",
        texto: "Sin SUBE ni Uber, caminaste horas o pediste fiado. Perdiste una entrevista / entrega y alguien más se quedó con tu lugar.",
        dinero: -Math.round(lostGig * 0.85),
        deltas: { capital_social: -4, estres: 8, salud: -3 },
        tono: "malo",
      };
    case "alquiler":
      return {
        bill_id: billId,
        titulo: "Sin techo estable",
        texto: "El dueño te apuró y tuviste que mudarte a los apurones. Perdiste cosas, contactos y una semana de foco. La calle no factura.",
        dinero: -lostBig,
        deltas: { capital_social: -10, bienestar: -10, estres: 12, salud: -4 },
        tono: "malo",
      };
    case "comida":
      return {
        bill_id: billId,
        titulo: "Cuerpo en modo supervivencia",
        texto: "Comiste mal o casi nada. En el laburo te mareaste y te mandaron a casa sin el día. Menos plata, más vergüenza.",
        dinero: -Math.round(lostGig * 0.6),
        deltas: { salud: -8, bienestar: -6, capital_social: -3 },
        tono: "malo",
      };
    case "prepaga":
      return {
        bill_id: billId,
        titulo: "Urgencia sin cobertura",
        texto: "Te agarró un dolor y pagaste particular o te aguantaste. Perdiste días y plata que no tenías pensada.",
        dinero: -scale(state, 0.15, 25000),
        deltas: { salud: -10, estres: 8, bienestar: -6 },
        tono: "malo",
      };
    case "psicologo":
      return {
        bill_id: billId,
        titulo: "La cabeza no espera",
        texto: "Salteaste la sesión. Una pelea boluda te costó un cliente / un favor del barrio.",
        dinero: -Math.round(lostGig * 0.5),
        deltas: { bienestar: -8, estres: 10, capital_social: -5 },
        tono: "malo",
      };
    case "gym":
      return {
        bill_id: billId,
        titulo: "Se cayó la rutina",
        texto: "Dejaste el gym. Te cruzaste a alguien importante hecho un desastre y se notó. Menos networking, más flojera.",
        dinero: 0,
        deltas: { capital_social: -4, salud: -3, bienestar: -4 },
        tono: "malo",
      };
    case "perro":
      return {
        bill_id: billId,
        titulo: "El perro también pasa factura",
        texto: "El vecino se quejó del ladrido / la mugre. Tuviste que pagar un arreglo improvisado y bancarte la mirada fea.",
        dinero: -8000,
        deltas: { capital_social: -6, bienestar: -8, estres: 6 },
        tono: "malo",
      };
    case "cuotas_multa":
      return {
        bill_id: billId,
        titulo: "La multa se hincha",
        texto: "No pagaste la cuota. Te llegaron intereses y una citación que te hizo perder un medio día de laburo.",
        dinero: -15000,
        deltas: { estres: 8, capital_social: -4 },
        tono: "malo",
      };
    default:
      return {
        bill_id: billId,
        titulo: "Cuenta salteada",
        texto: "Dejaste una cuenta sin pagar. El mes te cobró en estrés, reputación y alguna plata que se escapó por el costado.",
        dinero: -Math.round(lostGig * 0.4),
        deltas: { estres: 4, bienestar: -3, capital_social: -2 },
        tono: "malo",
      };
  }
}

/** Small upside when you keep key bills current — makes paying feel real. */
export function bonusForPaidBill(
  billId: string,
  state: PlayerState,
): MonthStoryBeat | null {
  const win = scale(state, 0.08, 5000);

  switch (billId) {
    case "celular":
      return {
        bill_id: billId,
        titulo: "Te ubicaron a tiempo",
        texto: "Con el celu al día te llegó una propuesta / un freelo corto. Contestaste, cerraste y cobraste algo extra.",
        dinero: win,
        deltas: { capital_social: 3, bienestar: 2 },
        tono: "bueno",
      };
    case "agua_gas":
    case "servicios":
      if (!isOfficeOrClientFacing(state)) return null;
      return {
        bill_id: billId,
        titulo: "Entraste como persona",
        texto: "Llegaste limpio y puntual a ver al cliente. Cerraste un acuerdo chico que no habrías cerrado oliendo a corte de servicio.",
        dinero: Math.round(win * 0.75),
        deltas: { capital_social: 4 },
        tono: "bueno",
      };
    case "transporte":
      return {
        bill_id: billId,
        titulo: "Puntualidad que factura",
        texto: "Llegaste a horario a una entrevista / entrega. Te anotaron para más laburo este mes.",
        dinero: Math.round(win * 0.6),
        deltas: { capital_social: 2, estres: -2 },
        tono: "bueno",
      };
    default:
      return null;
  }
}
