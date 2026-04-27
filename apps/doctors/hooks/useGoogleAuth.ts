"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, useCallback } from "react";
import { getGoogleOAuthUrl } from "../lib/google-calendar/constants";
import { toast } from "react-hot-toast";
import { api } from "@repo/database/convex/_generated/api";

export function useGoogleAuth(dict: any) {
  const isConnected = useQuery(api.googleCalendarTokens.hasGoogleConnected);
  const deleteTokens = useMutation(api.googleCalendarTokens.deleteTokens);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const connect = useCallback(() => {
    setIsConnecting(true);
    try {
      const url = getGoogleOAuthUrl();
      if (url === "#") {
        toast.error(dict.googleCalendar.notConfigured || "Google integration is not configured properly");
        setIsConnecting(false);
        return;
      }
      window.location.href = url;
    } catch (e) {
      toast.error(dict.googleCalendar.initError || "Failed to initialize connection");
      setIsConnecting(false);
    }
  }, [dict]);

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await deleteTokens();
      toast.success(dict.googleCalendar.disconnected || "Google Calendar disconnected successfully");
    } catch (e) {
      toast.error(dict.googleCalendar.disconnectError || "Failed to disconnect calendar");
    } finally {
      setIsDisconnecting(false);
    }
  }, [deleteTokens, dict]);

  return {
    isConnected: isConnected ?? false,
    isLoading: isConnected === undefined,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
  };
}
