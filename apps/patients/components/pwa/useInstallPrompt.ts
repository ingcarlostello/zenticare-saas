"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  BeforeInstallPromptEvent,
  Platform,
  InstallState,
} from "./InstallPrompt.types";
import {
  VISIT_COUNT_KEY,
  PROMPT_DISMISSED_KEY,
  PROMPT_DISMISSED_AT_KEY,
  MAX_PROMPT_VISITS,
  DISMISS_COOLDOWN_MS,
} from "./InstallPrompt.constants";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent || "";

  // iOS detection: iPhone, iPad, iPod
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }

  // Android detection
  if (/Android/.test(ua)) {
    return "android";
  }

  return "desktop";
}

function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;

  // Check standalone mode (works on both Android and iOS)
  if (window.matchMedia("(display-mode: standalone)").matches) return true;

  // iOS-specific check
  if ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) {
    return true;
  }

  return false;
}

function shouldShowPrompt(): boolean {
  if (typeof window === "undefined") return false;

  // Don't show if already installed
  if (isAppInstalled()) return false;

  // Check if dismissed and still in cooldown
  const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_AT_KEY);
  if (dismissedAt) {
    const elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed < DISMISS_COOLDOWN_MS) return false;
  }

  // Track visits
  const rawCount = localStorage.getItem(VISIT_COUNT_KEY);
  const visitCount = rawCount ? parseInt(rawCount, 10) : 0;
  const newCount = visitCount + 1;
  localStorage.setItem(VISIT_COUNT_KEY, String(newCount));

  // Show on 1st and 2nd visit
  return newCount <= MAX_PROMPT_VISITS;
}

export function useInstallPrompt() {
  const [state, setState] = useState<InstallState>({
    showPrompt: false,
    platform: "unknown",
    isInstalled: false,
    deferredPrompt: null,
  });

  useEffect(() => {
    const platform = detectPlatform();
    const installed = isAppInstalled();
    const show = shouldShowPrompt();

    setState((prev) => ({
      ...prev,
      platform,
      isInstalled: installed,
      showPrompt: show,
    }));

    // Listen for Chrome/Edge's beforeinstallprompt event (Android & Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState((prev) => ({
        ...prev,
        deferredPrompt: e as BeforeInstallPromptEvent,
        showPrompt: shouldShowPrompt(),
      }));
    };

    // Detect when the app is installed
    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        showPrompt: false,
        deferredPrompt: null,
      }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  /** Trigger the native Android/Desktop install prompt */
  const installApp = useCallback(async () => {
    if (!state.deferredPrompt) return;

    await state.deferredPrompt.prompt();
    const choice = await state.deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        showPrompt: false,
        deferredPrompt: null,
      }));
    }
  }, [state.deferredPrompt]);

  /** Dismiss the prompt and set cooldown */
  const dismissPrompt = useCallback(() => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
    localStorage.setItem(PROMPT_DISMISSED_AT_KEY, String(Date.now()));
    setState((prev) => ({ ...prev, showPrompt: false }));
  }, []);

  return {
    ...state,
    installApp,
    dismissPrompt,
  };
}
