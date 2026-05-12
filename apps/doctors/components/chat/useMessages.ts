"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import type { Id } from "@repo/database/convex/_generated/dataModel";
import type { EnrichedMessage } from "@repo/ui/chat";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function useMessages(conversationId: Id<"conversations"> | null) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const { canSendAttachments, chatMessageLimit, messageCount, isFree } =
    useFeatureAccess();

  const raw = useQuery(
    api.chat.listMessages,
    conversationId ? { conversationId, limit: 100 } : "skip"
  );

  const sendMessageMutation = useMutation(api.chat.sendMessage);
  const markAsReadMutation = useMutation(api.chat.markAsRead);
  const generateUploadUrl = useMutation(api.chat.generateUploadUrl);

  const isLoading = raw === undefined;
  // Reverse to show oldest first (query returns desc order)
  const messages: EnrichedMessage[] = raw ? ([...raw].reverse() as EnrichedMessage[]) : [];

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark as read when opening a conversation or new messages arrive
  useEffect(() => {
    if (conversationId) {
      markAsReadMutation({ conversationId }).catch(() => {});
    }
  }, [conversationId, messages.length, markAsReadMutation]);

  // Compute remaining messages
  const limit =
    chatMessageLimit === "unlimited" ? Infinity : (chatMessageLimit as number);
  const remaining = Math.max(0, limit - messageCount);
  const isLimitReached = remaining <= 0;

  const sendMessage = useCallback(
    async (text?: string, file?: File) => {
      if (!conversationId) return;
      if (!text?.trim() && !file) return;

      setIsSending(true);
      setError(null);

      try {
        let attachmentStorageId: Id<"_storage"> | undefined;
        let attachmentType: string | undefined;
        let attachmentName: string | undefined;

        if (file) {
          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            setError("FILE_TOO_LARGE");
            setIsSending(false);
            return;
          }

          setUploadingFile(true);

          // Determine attachment type
          if (file.type.startsWith("image/")) {
            attachmentType = "image";
          } else if (file.type === "application/pdf") {
            attachmentType = "pdf";
          } else {
            attachmentType = "document";
          }
          attachmentName = file.name;

          // Upload to Convex storage
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!response.ok) throw new Error("Upload failed");

          const { storageId } = await response.json();
          attachmentStorageId = storageId;
          setUploadingFile(false);
        }

        await sendMessageMutation({
          conversationId,
          text: text?.trim() || undefined,
          attachmentStorageId,
          attachmentType,
          attachmentName,
        });

        setInputText("");
      } catch (err) {
        const message = (err as Error).message || "";
        if (message.includes("MESSAGE_LIMIT_REACHED")) {
          setError("MESSAGE_LIMIT_REACHED");
        } else if (message.includes("ATTACHMENTS_NOT_AVAILABLE")) {
          setError("ATTACHMENTS_NOT_AVAILABLE");
        } else {
          setError("SEND_ERROR");
        }
        setUploadingFile(false);
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, sendMessageMutation, generateUploadUrl]
  );

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
    // Plan info
    canSendAttachments,
    remaining,
    isLimitReached,
    isFree,
    limit,
    messageCount,
  };
}
