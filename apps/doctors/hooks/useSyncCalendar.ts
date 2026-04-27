"use client";

import { api } from "@repo/database/convex/_generated/api";
import { useAction } from "convex/react";
import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export function useSyncCalendar(dict: any) {
  const syncAction = useAction(api.googleCalendarActions.syncEvents);
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    const loadingToast = toast.loading(dict.googleCalendar.syncing || "Syncing Google Calendar...");
    try {
      const result = await syncAction();
      const successMsg = (dict.googleCalendar.syncSuccess || "Synced {count} events!").replace("{count}", result.count.toString());
      toast.success(successMsg, { id: loadingToast });
    } catch (err) {
      console.error("Sync error:", err);
      toast.error(dict.googleCalendar.syncError || "Failed to sync calendar", { id: loadingToast });
    } finally {
      setIsSyncing(false);
    }
  }, [syncAction, dict]);

  return { sync, isSyncing };
}
