export type MetricKey =
  | "salud"
  | "estres"
  | "bienestar"
  | "capital_social"
  | "influencia";

export type EstadoCivil = "soltero" | "en_pareja" | "casado" | "gatero";

export type Genero = "hombre" | "mujer";

export type Vivienda = "villa" | "pieza" | "alquiler" | "barrio_cerrado";

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
  credenciales_requeridas?: string[];
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
  | { type: "job_tags_any"; values: string[] }
  | { type: "has_flag"; value: string }
  | { type: "missing_flag"; value: string }
  | { type: "has_credential"; value: string }
  | { type: "missing_credential"; value: string }
  | { type: "dinero_gte"; value: number }
  | { type: "dinero_lt"; value: number }
  | { type: "deuda_gte"; value: number }
  | { type: "deuda_lt"; value: number }
  | { type: "deuda_tier_gte"; value: number }
  | { type: "deuda_tier_lte"; value: number }
  | { type: "estado_civil"; value: EstadoCivil }
  | { type: "edad_gte"; value: number }
  | { type: "hijos_gte"; value: number }
  | { type: "hijos_lt"; value: number }
  | { type: "influencia_gte"; value: number }
  | { type: "vivienda"; value: Vivienda }
  | { type: "viviendas_any"; values: Vivienda[] }
  | { type: "genero"; value: Genero };

export type Effect =
  | {
      type: "delta";
      metric: MetricKey | "dinero" | "deuda" | "dinero_negro";
      amount: number;
    }
  | { type: "set_metric"; metric: MetricKey; value: number }
  | { type: "add_flag"; value: string }
  | { type: "remove_flag"; value: string }
  | { type: "add_credential"; value: string }
  | { type: "set_job"; job_id: string }
  | { type: "pay_debt"; amount: number | "all" }
  | { type: "set_estado_civil"; value: EstadoCivil }
  | { type: "add_hijo"; amount?: number }
  | { type: "risk"; chance: number; effects: Effect[] };

export interface EventOption {
  id: string;
  label: string;
  efectos: Effect[];
  /** Short consequence line for the month summary (El Ídolo style). */
  eco?: string;
}

export interface GameEvent {
  id: string;
  titulo: string;
  texto: string;
  peso: number;
  condiciones: Condition[];
  opciones: EventOption[];
}

export type MonthPhase =
  | "idle"
  | "capacitacion"
  | "trabajo"
  | "cuentas"
  | "partido";

export interface MonthSnapshot {
  dinero: number;
  dinero_negro: number;
  deuda: number;
  salud: number;
  estres: number;
  bienestar: number;
  capital_social: number;
  influencia: number;
}

export interface ChoiceEcho {
  event_titulo: string;
  opcion_label: string;
  texto: string;
  tono: "malo" | "bueno" | "neutro";
}

export interface PlayerState {
  nombre: string;
  genero: Genero;
  mes_nacimiento: number;
  edad: number;
  anio_calendario: number;
  mes_calendario: number;
  perfil_creado: boolean;
  influencia: number;
  estado_civil: EstadoCivil;
  hijos: number;
  vivienda: Vivienda;
  /** Months living with stolen electricity in the villa. */
  meses_luz_colgada: number;
  /** Plata en blanco (sueldo, formal). */
  dinero: number;
  /** Plata en negro (coimas, sobres) — solo relevante en política. */
  dinero_negro: number;
  deuda: number;
  salud: number;
  estres: number;
  bienestar: number;
  capital_social: number;
  /** Partido político actual, si hay. */
  partido: string | null;
  partido_nombre: string | null;
  trabajo_actual: TrabajoActual;
  mes: number;
  flags: string[];
  credenciales: string[];
  estudios_en_curso: EstudioEnCurso[];
  last_event_id: string | null;
  active_event_id: string | null;
  game_over: boolean;
  game_over_reason: string | null;
  game_over_kind: "victoria" | "derrota" | null;
  meses_estres_al_tope: number;
  acv_count: number;
  meses_bienestar_roto: number;
  month_phase: MonthPhase;
  /** IDs of actualidad/media events already shown (cycle resets when full). */
  actualidad_seen_ids: string[];
  /** Snapshot at month start for KPI bars. */
  month_start_snapshot: MonthSnapshot | null;
  pending_bills: {
    id: string;
    label: string;
    amount: number;
    al_pagar: Partial<Record<MetricKey, number>>;
    al_saltear: Partial<Record<MetricKey, number>>;
  }[] | null;
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
    historias?: {
      bill_id: string | null;
      titulo: string;
      texto: string;
      dinero: number;
      deltas: Partial<Record<MetricKey, number>>;
      tono: "malo" | "bueno" | "neutro";
    }[];
    choice_ecos?: ChoiceEcho[];
    metric_deltas?: Partial<
      Record<MetricKey | "dinero" | "dinero_negro" | "deuda", number>
    >;
    dinero_ganado?: number;
    dinero_perdido?: number;
    margen?: number;
    estudios_completados?: string[];
    interes_deuda?: number;
    pago_deuda?: number;
    balance_historias?: number;
  } | null;
}

export interface GameSavePayload {
  player_key: string;
  state: PlayerState;
}
