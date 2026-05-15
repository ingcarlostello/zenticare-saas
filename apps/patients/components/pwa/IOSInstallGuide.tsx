"use client";

import { Share, Plus } from "lucide-react";
import type { Dict } from "./InstallPrompt.types";

interface IOSInstallGuideProps {
  dict: Dict;
  onDismiss: () => void;
}

export function IOSInstallGuide({ dict, onDismiss }: IOSInstallGuideProps) {
  const t = dict.pwa as Record<string, string> | undefined;
  if (!t) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/70">{t.iosSubtitle}</p>

      <div className="space-y-3">
        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            1
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm text-base-content">{t.iosStep1}</span>
            <Share className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            2
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm text-base-content">{t.iosStep2}</span>
            <Plus className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            3
          </div>
          <div className="pt-1">
            <span className="text-sm text-base-content">{t.iosStep3}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="btn btn-ghost btn-sm w-full mt-2"
      >
        {t.dismiss}
      </button>
    </div>
  );
}
