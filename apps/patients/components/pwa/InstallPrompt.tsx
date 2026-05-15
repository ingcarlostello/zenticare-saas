"use client";

import Image from "next/image";
import { X, Download, Smartphone } from "lucide-react";
import { useInstallPrompt } from "./useInstallPrompt";
import { IOSInstallGuide } from "./IOSInstallGuide";
import type { InstallPromptProps } from "./InstallPrompt.types";

export function InstallPrompt({ dict, lang }: InstallPromptProps) {
  const { showPrompt, platform, isInstalled, installApp, dismissPrompt, deferredPrompt } =
    useInstallPrompt();

  const t = dict.pwa as Record<string, string> | undefined;

  // Don't render anything if prompt shouldn't be shown or dict is missing
  if (!showPrompt || isInstalled || !t) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] animate-fade-in"
        onClick={dismissPrompt}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 animate-slide-up sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:p-0">
        <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden">
          {/* Header */}
          <div className="relative p-5 pb-3 flex items-start gap-4">
            {/* App Icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
              <Image
                src="/icons/icon-192x192.png"
                alt="Zenticare"
                width={56}
                height={56}
                className="object-cover"
              />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-base-content leading-tight">
                {t.installTitle}
              </h3>
              <p className="text-sm text-base-content/60 mt-0.5">
                {t.installDescription}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={dismissPrompt}
              className="flex-shrink-0 btn btn-ghost btn-sm btn-circle -mt-1 -mr-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-5">
            {platform === "ios" ? (
              <IOSInstallGuide dict={dict} onDismiss={dismissPrompt} />
            ) : (
              <div className="space-y-3">
                {/* Features list */}
                <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <Smartphone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{t.featureAccess}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <Download className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{t.featureNoStore}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={dismissPrompt}
                    className="btn btn-ghost btn-sm flex-1"
                  >
                    {t.dismiss}
                  </button>
                  {deferredPrompt ? (
                    <button
                      onClick={installApp}
                      className="btn btn-primary btn-sm flex-1 gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t.installButton}
                    </button>
                  ) : (
                    <button
                      onClick={dismissPrompt}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      {t.understood}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
