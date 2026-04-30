"use client";

import { useAction, useConvexAuth } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface GoogleCallbackClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function GoogleCallbackClient({ dict }: GoogleCallbackClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const exchangeToken = useAction(api.googleCalendarActions.exchangeToken);
  
  const hasAttempted = useRef(false);
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading || !isAuthenticated) return;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      toast.error(dict.googleCalendar.connectError || "Failed to connect Google Calendar. Please try again.");
      router.push("/dashboard/calendar");
      return;
    }

    if (!code) {
      router.push("/dashboard/calendar");
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const processCode = async () => {
      try {
        await exchangeToken({ code });
        toast.success(dict.googleCalendar.connectSuccess || "Google Calendar connected successfully!");
        router.push("/dashboard/calendar");
      } catch (err) {
        console.error("Exchange error:", err);
        toast.error(dict.googleCalendar.genericError || "An error occurred while connecting the calendar.");
        router.push("/dashboard/calendar");
      }
    };

    processCode();
  }, [searchParams, exchangeToken, router, isAuthenticated, isLoading, dict]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] w-full">
      <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
      <h2 className="text-xl font-medium text-base-content">
        {dict.googleCalendar.connecting || "Connecting your Google Calendar..."}
      </h2>
    </div>
  );
}
