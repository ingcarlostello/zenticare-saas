"use client";

import { RefreshCw, ExternalLink, LogOut } from "lucide-react";

interface CalendarToolbarProps {
  onSync: () => void;
  isSyncing: boolean;
  onDisconnect: () => void;
  isDisconnecting: boolean;
  onOpenGoogleCalendar: () => void;
  dict: any;
}

export function CalendarToolbar({
  onSync,
  isSyncing,
  onDisconnect,
  isDisconnecting,
  onOpenGoogleCalendar,
  dict,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-base-100 p-2 rounded-lg">
      <button 
        onClick={onSync} 
        disabled={isSyncing}
        className="btn btn-square btn-outline btn-sm"
        title={dict.googleCalendar.syncBtnTitle || "Sync Calendar"}
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
      </button>

      <button 
        onClick={onOpenGoogleCalendar}
        className="btn btn-outline btn-sm bg-base-100 hidden sm:flex"
      >
        <span className="hidden md:inline">{dict.googleCalendar.openBtn || "Open in Google Calendar"}</span>
        <span className="md:hidden">{dict.googleCalendar.openBtnMobile || "Open"}</span>
      </button>

      <button 
        onClick={onDisconnect}
        disabled={isDisconnecting}
        className="btn btn-outline btn-error btn-sm"
      >
        {isDisconnecting ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <LogOut className="w-4 h-4 mr-1" />
        )}
        <span className="hidden sm:inline">{dict.googleCalendar.disconnectBtn || "Disconnect"}</span>
      </button>
    </div>
  );
}
