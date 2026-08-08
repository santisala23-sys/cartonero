import { hasCredential } from "@/lib/credentials";
import { getDebtTier } from "@/lib/debt";
import { getJobById } from "@/lib/jobs";
import type { Condition, PlayerState } from "@/lib/types";

export function evaluateCondition(
  state: PlayerState,
  condition: Condition,
): boolean {
  switch (condition.type) {
    case "metric_gt":
      return state[condition.metric] > condition.value;
    case "metric_lt":
      return state[condition.metric] < condition.value;
    case "metric_gte":
      return state[condition.metric] >= condition.value;
    case "metric_lte":
      return state[condition.metric] <= condition.value;
    case "job_id":
      return state.trabajo_actual.id === condition.value;
    case "job_tag": {
      const job = getJobById(state.trabajo_actual.id);
      return job?.tags.includes(condition.value) ?? false;
    }
    case "job_tags_any": {
      const job = getJobById(state.trabajo_actual.id);
      if (!job) return false;
      return condition.values.some((t) => job.tags.includes(t));
    }
    case "has_flag":
      return state.flags.includes(condition.value);
    case "has_flags_any":
      return condition.values.some((f) => state.flags.includes(f));
    case "missing_flag":
      return !state.flags.includes(condition.value);
    case "has_credential":
      return hasCredential(state, condition.value);
    case "missing_credential":
      return !hasCredential(state, condition.value);
    case "dinero_gte":
      return state.dinero >= condition.value;
    case "dinero_lt":
      return state.dinero < condition.value;
    case "deuda_gte":
      return state.deuda >= condition.value;
    case "deuda_lt":
      return state.deuda < condition.value;
    case "deuda_tier_gte":
      return getDebtTier(state.deuda) >= condition.value;
    case "deuda_tier_lte":
      return getDebtTier(state.deuda) <= condition.value;
    case "estado_civil":
      return state.estado_civil === condition.value;
    case "edad_gte":
      return state.edad >= condition.value;
    case "hijos_gte":
      return state.hijos >= condition.value;
    case "hijos_lt":
      return state.hijos < condition.value;
    case "influencia_gte":
      return state.influencia >= condition.value;
    case "vivienda":
      return state.vivienda === condition.value;
    case "viviendas_any":
      return condition.values.includes(state.vivienda);
    case "genero":
      return state.genero === condition.value;
    default:
      return true;
  }
}

export function evaluateConditions(
  state: PlayerState,
  conditions: Condition[],
): boolean {
  return conditions.every((condition) => evaluateCondition(state, condition));
}
