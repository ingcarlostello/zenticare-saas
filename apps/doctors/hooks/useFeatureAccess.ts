"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import {
  getPlanConfig,
  hasFeature,
  getFeatureLimit,
  getAllFeatureKeys,
  type FeatureKey,
  type PlanConfig,
} from "@repo/database/convex/plans";

/**
 * Reactive hook that exposes feature-access helpers based on the current
 * user's plan.  Because it subscribes to `users.getCurrentUser` through
 * Convex's real-time layer, the UI updates automatically if the plan changes
 * (e.g. after a Paddle upgrade webhook).
 */
export function useFeatureAccess() {
  const user = useQuery(api.users.getCurrentUser);
  const isLoading = user === undefined;
  const planKey = user?.planKey ?? "free";
  const config: PlanConfig = getPlanConfig(planKey);

  return {
    /** Raw plan key string ("free", "pro", …) */
    planKey,
    /** Full plan config object */
    config,
    /** True while the Convex query is still loading */
    isLoading,

    // ── Generic helpers ────────────────────────────────────────────────
    /** Check any boolean / numeric feature */
    hasFeature: (feature: FeatureKey) => hasFeature(planKey, feature),
    /** Get the numeric limit for a capped feature */
    getLimit: (feature: FeatureKey) => getFeatureLimit(planKey, feature),
    /** All registered feature keys in the system */
    allFeatures: getAllFeatureKeys(),

    // ── Convenience shortcuts ──────────────────────────────────────────
    canSendAttachments: config.features.chat_attachments,
    canUseReminders: config.features.scheduled_reminders,
    chatMessageLimit: config.features.chat_messages,
    messageCount: user?.messageCount ?? 0,

    isPro: planKey === "pro",
    isFree: planKey === "free" || !planKey,
  };
}
