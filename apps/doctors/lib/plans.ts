export const PLAN_TIERS: Record<string, number> = {
  free: 0,
  pro: 1,
  max: 2,
  gold: 3,
  platinum: 4,
};

export function getPlanWeight(planKey?: string | null): number {
  if (!planKey) return PLAN_TIERS.free as number;
  return PLAN_TIERS[planKey.toLowerCase()] as number ?? PLAN_TIERS.free;
}
