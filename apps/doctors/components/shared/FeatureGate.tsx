"use client";

import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { UpgradeOverlay } from "./UpgradeOverlay";
import type { FeatureKey } from "@repo/database/convex/plans";

interface FeatureGateProps {
  /** Which feature this gate protects */
  feature: FeatureKey;
  /** Content to render (visible but dimmed when locked) */
  children: React.ReactNode;
  /**
   * When `true` (default), shows a blurred overlay with an upgrade CTA
   * instead of hiding the content entirely.  Set to `false` to hide.
   */
  upgradePrompt?: boolean;
  /** Current locale for the upgrade link */
  lang?: string;
  /** i18n dictionary forwarded to the overlay */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: { pricing: any; features?: any };
}

/**
 * Wrapper component that conditionally renders children based on the
 * current user's plan.
 *
 * ```tsx
 * <FeatureGate feature="scheduled_reminders" lang={lang} dict={dict}>
 *   <ReminderSchedulerButton />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  upgradePrompt = true,
  lang,
  dict,
}: FeatureGateProps) {
  const { hasFeature, isLoading } = useFeatureAccess();

  // While loading, render children (avoids layout shift)
  if (isLoading) {
    return <>{children}</>;
  }

  // User has the feature — render normally
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // No access — show upgrade prompt or hide
  if (upgradePrompt) {
    return (
      <div className="relative">
        <div className="opacity-40 pointer-events-none select-none" aria-hidden>
          {children}
        </div>
        <UpgradeOverlay feature={feature} lang={lang} dict={dict} />
      </div>
    );
  }

  return null;
}
