"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import type { FeatureKey } from "@repo/database/convex/plans";

/** i18n dictionary shape expected by this component */
interface UpgradeDict {
  features?: {
    upgradeTitle?: string;
    upgradeDescription?: string;
    upgradeBtn?: string;
    featureLabels?: Record<string, string>;
  };
}

interface UpgradeOverlayProps {
  feature: FeatureKey;
  lang?: string;
  dict?: UpgradeDict;
}

/**
 * Semi-transparent overlay shown on top of gated UI.
 * Displays a short "Upgrade to Pro" CTA with a link to the pricing page.
 */
export function UpgradeOverlay({ feature, lang = "en", dict }: UpgradeOverlayProps) {
  const featureLabel =
    dict?.features?.featureLabels?.[feature] ?? feature.replace(/_/g, " ");

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-base-300/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 text-center px-4">
        <Crown className="h-8 w-8 text-warning" />
        <p className="font-semibold text-base-content text-sm">
          {dict?.features?.upgradeTitle ?? "Unlock this feature"}
        </p>
        <p className="text-xs opacity-70 max-w-52">
          {dict?.features?.upgradeDescription ??
            `"${featureLabel}" is available on the Pro plan.`}
        </p>
        <Link
          href={`/${lang}/pricing`}
          className="btn btn-primary btn-sm mt-1 gap-1"
        >
          <Crown className="h-4 w-4" />
          {dict?.features?.upgradeBtn ?? "Upgrade to Pro"}
        </Link>
      </div>
    </div>
  );
}
