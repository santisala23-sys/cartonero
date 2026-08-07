export type MetricKey = "salud" | "estres" | "bienestar" | "capital_social";

export type JobRama =
  | "cartonero"
  | "politica"
  | "tech"
  | "comercio"
  | "transporte"
  | "gastronomia"
  | "oficios"
  | "salud"
  | "educacion"
  | "legal"
  | "servicios"
  | "arte"
  | "seguridad"
  | "campo";

export type CredentialTipo =
  | "curso"
  | "titulo"
  | "certificacion"
  | "aptitud"
  | "licencia"
  | "idioma"
  | "oficio";

export interface TrabajoActual {
  id: string;
  titulo: string;
  sueldo: number;
  nivel_estres_mensual: number;
}

export interface JobRequisitos {
  job_previo?: string | null;
  dinero_min?: number;
  capital_social_min?: number;
  flags_requeridos?: string[];
  salud_min?: number;
  /** All of these credentials are required. */
  credenciales_requeridas?: string[];
  /** At least one of these credentials is required (if non-empty). */
  credenciales_algunas?: string[];
}

export interface Job {
  id: string;
  titulo: string;
  sueldo: number;
  nivel_estres_mensual: number;
  rama: JobRama | string;
  tags: string[];
  requisitos: JobRequisitos;
  descripcion?: string;
}

export interface CredentialRequisitos {
  credenciales?: string[];
  dinero_min?: number;
  capital_social_min?: number;
}

export interface Credential {
  id: string;
  nombre: string;
  tipo: CredentialTipo | string;
  categoria: string;
  costo: number;
  duracion_meses: number;
  estres: number;
  requisitos: CredentialRequisitos;
  descripcion?: string;
}

export interface EstudioEnCurso {
  credential_id: string;
  meses_restantes: number;
}

export type Condition =
  | { type: "metric_gt"; metric: MetricKey; value: number }
  | { type: "metric_lt"; metric: MetricKey; value: number }
  | { type: "metric_gte"; metric: MetricKey; value: number }
  | { type: "metric_lte"; metric: MetricKey; value: number }
  | { type: "job_id"; value: string }
  | { type: "job_tag"; value: string }
  | { type: "has_flag"; value: string }
  | { type: "missing_flag"; value: string }
  | { type: "has_credential"; value: string }
  | { type: "missing_credential"; value: string }
  | { type: "dinero_gte"; value: number }
  | { type: "dinero_lt"; value: number }
  | { type: "deuda_gte"; value: number }
  | { type: "deuda_lt"; value: number }
  | { type: "deuda_tier_gte"; value: number }
  | { type: "deuda_tier_lte"; value: number };

export type Effect =
  | { type: "delta"; metric: MetricKey | "dinero" | "deuda"; amount: number }
  | { type: "set_metric"; metric: MetricKey; value: number }
  | { type: "add_flag"; value: string }
  | { type: "remove_flag"; value: string }
  | { type: "add_credential"; value: string }
  | { type: "set_job"; job_id: string }
  | { type: "pay_debt"; amount: number | "all" }
  | { type: "risk"; chance: number; effects: Effect[] };

export interface EventOption {
  id: string;
  label: string;
  efectos: Effect[];
}

export interface GameEvent {
  id: string;
  titulo: string;
  texto: string;
  peso: number;
  condiciones: Condition[];
  opciones: EventOption[];
}

export interface PlayerState {
  dinero: number;
  deuda: number;
  salud: number;
  estres: number;
  bienestar: number;
  capital_social: number;
  trabajo_actual: TrabajoActual;
  mes: number;
  flags: string[];
  /** Unlocked credentials / aptitudes. */
  credenciales: string[];
  /** Formal studies still in progress. */
  estudios_en_curso: EstudioEnCurso[];
  last_event_id: string | null;
  active_event_id: string | null;
  game_over: boolean;
  game_over_reason: string | null;
  /** "victoria" | "derrota" when the run ended. */
  game_over_kind: "victoria" | "derrota" | null;
  /** Consecutive months with estrés at 100. */
  meses_estres_al_tope: number;
  /** How many strokes (ACV / bobazos) you survived. */
  acv_count: number;
  /** Consecutive months with bienestar at 0. */
  meses_bienestar_roto: number;
  /** Bills waiting for pay/skip decisions this month. */
  pending_bills: {
    id: string;
    label: string;
    amount: number;
    al_pagar: Partial<Record<MetricKey, number>>;
    al_saltear: Partial<Record<MetricKey, number>>;
  }[] | null;
  /** After bills resolve, show month résumé before the random event. */
  pending_month_summary: boolean;
  last_month_ledger: {
    sueldo: number;
    lines: {
      id: string;
      label: string;
      amount: number;
      pagado: boolean;
      al_pagar?: Partial<Record<MetricKey, number>>;
      al_saltear?: Partial<Record<MetricKey, number>>;
    }[];
    total_gastos: number;
    total_salteado?: number;
    neto: number;
    /** Narrative beats from paying / skipping bills. */
    historias?: {
      bill_id: string | null;
      titulo: string;
      texto: string;
      dinero: number;
      deltas: Partial<Record<MetricKey, number>>;
      tono: "malo" | "bueno" | "neutro";
    }[];
    estudios_completados?: string[];
    interes_deuda?: number;
    /** Cash leftover after bills applied to outstanding debt. */
    pago_deuda?: number;
    /** Extra money from story beats (can be negative). */
    balance_historias?: number;
  } | null;
}

export interface GameSavePayload {
  player_key: string;
  state: PlayerState;
}
