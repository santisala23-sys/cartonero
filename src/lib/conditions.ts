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
    case "has_flag":
      return state.flags.includes(condition.value);
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
