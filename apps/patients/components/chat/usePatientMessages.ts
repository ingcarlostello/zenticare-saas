"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import type { Id } from "@repo/database/convex/_generated/dataModel";
import type { EnrichedMessage } from "@repo/ui/chat";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function usePatientMessages(patientId: Id<"patients">) {
  // 1. Get conversation (if exists)
  const conversation = useQuery(api.chat.patientGetConversation, { patientId });
  const conversationId = conversation?._id;

  // 2. Fetch messages
  const rawMessages = useQuery(
    api.chat.patientListMessages,
    conversationId ? { conversationId, patientId } : "skip"
  );
  
  // 3. Mark as read
  const markAsRead = useMutation(api.chat.patientMarkAsRead);
  useEffect(() => {
    if (conversationId && conversation?.unreadByPatient && conversation.unreadByPatient > 0) {
      markAsRead({ conversationId, patientId }).catch(console.error);
    }
  }, [conversationId, conversation?.unreadByPatient, markAsRead, patientId]);

  // 4. Mutations
  const getOrCreateConversation = useMutation(api.chat.patientGetOrCreateConversation);
  const sendMsg = useMutation(api.chat.patientSendMessage);
  const generateUploadUrl = useMutation(api.chat.patientGenerateUploadUrl);

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rawMessages]);

  const sendMessage = async (textOrIgnored?: string, file?: File) => {
    if (!inputText.trim() && !file) return;

    try {
      setIsSending(true);
      setError(null);

      // Ensure we have a conversation first
      let activeConvId = conversationId;
      if (!activeConvId) {
        activeConvId = await getOrCreateConversation({ patientId });
      }

      let storageId: Id<"_storage"> | undefined;
      let attachmentType: string | undefined;

      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          setError("FILE_TOO_LARGE");
          setIsSending(false);
          return;
        }
        setUploadingFile(file);

        // Get upload URL
        const uploadUrl = await generateUploadUrl({ patientId });

        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error("Upload failed");

        const { storageId: returnedStorageId } = await result.json();
        storageId = returnedStorageId;
        
        attachmentType = file.type.startsWith("image/") 
          ? "image" 
          : file.type.includes("pdf") 
            ? "pdf" 
            : "document";
      }

      // Send the actual message
      await sendMsg({
        conversationId: activeConvId,
        patientId,
        text: inputText.trim() || undefined,
        attachmentStorageId: storageId,
        attachmentType,
        attachmentName: file?.name,
      });

      setInputText("");
      setUploadingFile(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      const msg = (err as Error).message || "";
      if (msg.includes("MESSAGE_LIMIT_REACHED")) {
        setError("MESSAGE_LIMIT_REACHED");
      } else if (msg.includes("ATTACHMENTS_NOT_AVAILABLE")) {
        setError("ATTACHMENTS_NOT_AVAILABLE");
      } else {
        setError("FAILED_TO_SEND");
      }
    } finally {
      setIsSending(false);
      setUploadingFile(null);
    }
  };

  // The patient limits are dictated by the doctor's plan.
  // The doctor's plan is checked on the server.
  // For the UI, we'll assume they can send attachments and if it fails, it shows the error.
  // Alternatively, we could fetch the doctor's plan limits here, but to save complexity, 
  // we'll just allow attachment attempts and let the server block it.
  
  return {
    messages: [...(rawMessages ?? [])].reverse() as EnrichedMessage[],
    isLoading: rawMessages === undefined && conversationId !== undefined,
    inputText,
    setInputText,
    isSending,
    uploadingFile,
    error,
    setError,
    sendMessage,
    scrollRef,
    conversation,
  };
}
