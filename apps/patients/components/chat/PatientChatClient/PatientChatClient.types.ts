import type React from "react";
import type { EnrichedMessage } from "@repo/ui/chat";

export interface PatientChatClientProps {
  dict: { chat: any };
  lang: string;
  patientId: string;
}

export interface UsePatientChatClientReturn {
  messages: EnrichedMessage[];
  isLoading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  uploadingFile: File | null;
  error: string | null;
  setError: (error: string | null) => void;
  sendMessage: (textOrIgnored?: string, file?: File) => Promise<void>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  conversation: any;
  handleRespondToReminder: (messageId: string, actionId: string) => Promise<void>;
  respondingMessageId: string | null;
  doctorName: string;
  initials: string;
}
