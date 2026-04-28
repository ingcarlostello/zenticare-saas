/**
 * Feature Access Guards — Backend layer
 *
 * These helpers run inside Convex queries / mutations to enforce feature
 * gating server-side.  Even if the frontend hides a button, the backend
 * will reject the operation when the doctor's plan doesn't allow it.
 */
import { QueryCtx, MutationCtx } from "../_generated/server";
import {
  getPlanConfig,
  hasFeature,
  type FeatureKey,
} from "../plans";

// ---------------------------------------------------------------------------
// Internal helper — resolve the current user's planKey
// ---------------------------------------------------------------------------
async function getUserPlanKey(
  ctx: QueryCtx | MutationCtx
): Promise<{ planKey: string; clerkId: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return {
    planKey: user?.planKey ?? "free",
    clerkId: identity.subject,
  };
}

// ---------------------------------------------------------------------------
// Public guards — use these at the top of your mutations / queries
// ---------------------------------------------------------------------------

/**
 * Throws if the current user's plan does NOT include the given feature.
 *
 * Usage:
 * ```ts
 * await requireFeature(ctx, "scheduled_reminders");
 * ```
 */
export async function requireFeature(
  ctx: QueryCtx | MutationCtx,
  feature: FeatureKey
): Promise<void> {
  const { planKey } = await getUserPlanKey(ctx);
  if (!hasFeature(planKey, feature)) {
    throw new Error(`FEATURE_GATED:${feature}`);
  }
}

/**
 * Throws if the current user has reached their chat message limit.
 *
 * Usage:
 * ```ts
 * await requireChatMessageLimit(ctx, user.messageCount ?? 0);
 * ```
 */
export async function requireChatMessageLimit(
  ctx: QueryCtx | MutationCtx,
  currentCount: number
): Promise<void> {
  const { planKey } = await getUserPlanKey(ctx);
  const config = getPlanConfig(planKey);
  const limit = config.features.chat_messages;

  if (limit !== "unlimited" && currentCount >= limit) {
    throw new Error(`FEATURE_LIMIT:chat_messages:${limit}`);
  }
}

/**
 * Returns the current user's plan key without throwing.
 * Useful when a query needs to adapt its response based on the plan
 * (e.g. return `canSendAttachments: true/false` to the frontend).
 */
export async function getCurrentPlanKey(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const { planKey } = await getUserPlanKey(ctx);
  return planKey;
}
