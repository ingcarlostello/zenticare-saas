import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import type { Id } from "@repo/database/convex/_generated/dataModel";
import { getInitials } from "@repo/ui/chat";
import { usePatientMessages } from "../usePatientMessages";
import { PatientChatClientProps, UsePatientChatClientReturn } from "./PatientChatClient.types";

export function usePatientChatClient({ 
  dict, 
  patientId 
}: Pick<PatientChatClientProps, "dict" | "patientId">): UsePatientChatClientReturn {
  const {
    messages,
    isLoading,
    inputText,
    setInputText,
    isSending,
    uploadingFile,
    error,
    setError,
    sendMessage,
    scrollRef,
    conversation,
  } = usePatientMessages(patientId as Id<"patients">);

  const respondToReminder = useMutation(api.chat.patientRespondToReminder);
  const [respondingMessageId, setRespondingMessageId] = useState<string | null>(null);

  const handleRespondToReminder = async (messageId: string, actionId: string) => {
    try {
      setRespondingMessageId(messageId);
      await respondToReminder({
        messageId: messageId as Id<"messages">,
        patientId: patientId as Id<"patients">,
        actionId,
      });
    } catch (err) {
      console.error("Failed to respond to reminder:", err);
      const msg = (err as Error).message || "";
      if (msg.includes("ALREADY_RESPONDED")) {
        // Silently ignore — the UI will update via subscription
      } else {
        setError("FAILED_TO_SEND");
      }
    } finally {
      setRespondingMessageId(null);
    }
  };

  const doctorName = conversation?.doctorName ?? dict.chat?.doctor ?? "Doctor";
  const initials = getInitials(doctorName);

  return {
    messages,
    isLoading,
    inputText,
    setInputText,
    isSending,
    uploadingFile,
    error,
    setError,
    sendMessage,
    scrollRef,
    conversation,
    handleRespondToReminder,
    respondingMessageId,
    doctorName,
    initials,
  };
}
