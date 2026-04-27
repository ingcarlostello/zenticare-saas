"use client";

import { CalendarDays } from "lucide-react";

interface CalendarDisconnectedProps {
  onConnect: () => void;
  isConnecting: boolean;
  dict: any; // Using any for simplicity, can type it properly with the dictionary type later
}

export function CalendarDisconnected({ onConnect, isConnecting, dict }: CalendarDisconnectedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] w-full bg-base-100 rounded-box border border-base-200">
      <div className="flex flex-col items-center max-w-md text-center p-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <CalendarDays className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-base-content mb-3">
          {dict.googleCalendar.connectTitle || "Connect your Google Calendar"}
        </h2>
        
        <p className="text-base-content/70 mb-8">
          {dict.googleCalendar.connectDescription || "Sync your appointments and manage your schedule directly from this dashboard."}
        </p>
        
        <button 
          onClick={onConnect} 
          disabled={isConnecting}
          className="btn btn-primary min-w-[200px]"
        >
          {isConnecting ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : null}
          {dict.googleCalendar.connectBtn || "Connect Google Calendar"}
        </button>
      </div>
    </div>
  );
}
