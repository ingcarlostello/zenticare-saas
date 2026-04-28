/**
 * Plan Configuration — Single Source of Truth
 *
 * This file defines every feature available in the system and maps each plan
 * to its set of capabilities.  To add a new feature or plan, update the types
 * and the PLAN_CONFIGS map below — all backend guards and frontend hooks will
 * pick it up automatically.
 */

// ---------------------------------------------------------------------------
// Feature keys — extend this union when you introduce a new gated capability
// ---------------------------------------------------------------------------
export type FeatureKey =
  | "chat_messages" // max messages allowed (number | "unlimited")
  | "chat_attachments" // can send files / images through chat
  | "scheduled_reminders"; // automatic appointment reminders via scheduled functions
// Future features — just add here:
// | "video_calls"
// | "advanced_reports"
// | "multi_location"

// ---------------------------------------------------------------------------
// Plan shape
// ---------------------------------------------------------------------------
export interface PlanFeatures {
  chat_messages: number | "unlimited";
  chat_attachments: boolean;
  scheduled_reminders: boolean;
  // Add future features here with their type
}

export interface PlanConfig {
  name: string;
  features: PlanFeatures;
}

// ---------------------------------------------------------------------------
// Plan → Features map
// ---------------------------------------------------------------------------
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  free: {
    name: "Free",
    features: {
      chat_messages: 100,
      chat_attachments: false,
      scheduled_reminders: false,
    },
  },
  pro: {
    name: "Pro",
    features: {
      chat_messages: "unlimited",
      chat_attachments: true,
      scheduled_reminders: true,
    },
  },
  // Example future plans:
  // gold: {
  //   name: "Gold",
  //   features: {
  //     chat_messages: "unlimited",
  //     chat_attachments: true,
  //     scheduled_reminders: true,
  //     // video_calls: true,
  //   },
  // },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the config for a given plan key, defaulting to "free". */
export function getPlanConfig(planKey: string | undefined): PlanConfig {
  return PLAN_CONFIGS[planKey ?? "free"] ?? PLAN_CONFIGS["free"]!;
}

/** Check whether a plan has access to a boolean / numeric feature. */
export function hasFeature(
  planKey: string | undefined,
  feature: FeatureKey
): boolean {
  const config = getPlanConfig(planKey);
  const value = config.features[feature as keyof PlanFeatures];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (value === "unlimited") return true;
  return false;
}

/** Return the numeric limit for a feature (or Infinity for "unlimited"). */
export function getFeatureLimit(
  planKey: string | undefined,
  feature: FeatureKey
): number {
  const config = getPlanConfig(planKey);
  const value = config.features[feature as keyof PlanFeatures];
  if (value === "unlimited") return Infinity;
  if (typeof value === "number") return value;
  return 0;
}

/** Get all feature keys defined in the system. */
export function getAllFeatureKeys(): FeatureKey[] {
  const sample = PLAN_CONFIGS["free"]!;
  return Object.keys(sample.features) as FeatureKey[];
}
