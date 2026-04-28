"use client";

import Link from "next/link";
import {
  Crown,
  MessageSquare,
  Paperclip,
  Bell,
  Check,
  Lock,
} from "lucide-react";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import type { FeatureKey } from "@repo/database/convex/plans";
import type { Locale } from "../../app/i18n/config";

/** Shape of the i18n `features` section in the dictionary */
interface FeaturesDict {
  panelTitle?: string;
  yourPlan?: string;
  active?: string;
  locked?: string;
  upgradeBtn?: string;
  messagesUsed?: string;
  messagesUnlimited?: string;
  featureLabels?: Record<string, string>;
}

interface FeaturesPanelCardProps {
  dict: { features?: FeaturesDict };
  lang: Locale;
}

/** Icon map for known features */
const FEATURE_ICONS: Record<FeatureKey, React.ReactNode> = {
  chat_messages: <MessageSquare className="h-5 w-5" />,
  chat_attachments: <Paperclip className="h-5 w-5" />,
  scheduled_reminders: <Bell className="h-5 w-5" />,
};

/**
 * Dashboard card that shows doctors which features their plan includes and
 * which are locked.  Designed for upsell — locked features are clearly
 * visible with a "Upgrade" CTA.
 */
export function FeaturesPanelCard({ dict, lang }: FeaturesPanelCardProps) {
  const {
    planKey,
    config,
    allFeatures,
    hasFeature,
    messageCount,
    chatMessageLimit,
    isLoading,
  } = useFeatureAccess();

  const fd = dict.features ?? {};

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" />
          </div>
        </div>
      </div>
    );
  }

  const planDisplayName = config.name;
  const isPro = planKey === "pro";

  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="card-title text-lg flex items-center gap-2">
            {isPro && <Crown className="h-5 w-5 text-warning" />}
            {fd.panelTitle ?? "Your Features"}
          </h2>
          <div
            className={`badge ${isPro ? "badge-warning" : "badge-ghost"} badge-sm font-medium gap-1`}
          >
            {fd.yourPlan ?? "Plan"}: {planDisplayName}
          </div>
        </div>

        {/* Chat message usage (special treatment — it has a counter) */}
        <div className="bg-base-200/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">
                {fd.featureLabels?.chat_messages ?? "Chat Messages"}
              </p>
              <p className="text-xs opacity-60">
                {chatMessageLimit === "unlimited"
                  ? fd.messagesUnlimited ?? "Unlimited messages"
                  : `${messageCount} / ${chatMessageLimit} ${fd.messagesUsed ?? "used"}`}
              </p>
            </div>
          </div>
          {chatMessageLimit !== "unlimited" && (
            <progress
              className="progress progress-primary w-24"
              value={messageCount}
              max={typeof chatMessageLimit === "number" ? chatMessageLimit : 100}
            />
          )}
        </div>

        {/* Feature list */}
        <ul className="space-y-2">
          {allFeatures
            .filter((f) => f !== "chat_messages") // already shown above
            .map((feature) => {
              const enabled = hasFeature(feature);
              const label =
                fd.featureLabels?.[feature] ?? feature.replace(/_/g, " ");
              return (
                <li
                  key={feature}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                    enabled
                      ? "bg-success/10"
                      : "bg-base-200/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {FEATURE_ICONS[feature] ?? (
                      <div className="h-5 w-5 rounded-full bg-base-300" />
                    )}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {enabled ? (
                    <span className="badge badge-success badge-sm gap-1">
                      <Check className="h-3 w-3" />
                      {fd.active ?? "Active"}
                    </span>
                  ) : (
                    <span className="badge badge-ghost badge-sm gap-1">
                      <Lock className="h-3 w-3" />
                      {fd.locked ?? "Locked"}
                    </span>
                  )}
                </li>
              );
            })}
        </ul>

        {/* Upgrade CTA for free users */}
        {!isPro && (
          <Link
            href={`/${lang}/pricing`}
            className="btn btn-primary btn-sm w-full mt-2 gap-2"
          >
            <Crown className="h-4 w-4" />
            {fd.upgradeBtn ?? "Upgrade to Pro"}
          </Link>
        )}
      </div>
    </div>
  );
}
