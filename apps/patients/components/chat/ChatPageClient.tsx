"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { PatientChatClient } from "./PatientChatClient";
import { MessageSquare } from "lucide-react";

interface ChatPageClientProps {
  dict: Record<string, any>;
  lang: string;
}

export function ChatPageClient({ dict, lang }: ChatPageClientProps) {
  const patientId = useQuery(api.patientPortal.getMyPatientId);

  if (patientId === undefined) {
    return (
      <div className="flex justify-center items-center h-full py-16">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  if (patientId === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
        <MessageSquare className="w-12 h-12 opacity-20" />
        <p className="text-base-content/60 text-center max-w-sm">
          {dict.chat?.noConversations ?? "No conversations yet. Your doctor will connect with you here."}
        </p>
      </div>
    );
  }

  return <PatientChatClient patientId={patientId} dict={dict as { chat: any }} lang={lang} />;
}
