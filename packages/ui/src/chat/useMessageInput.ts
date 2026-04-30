"use client";

import { useRef, useCallback, useState } from "react";

interface UseMessageInputProps {
  inputText: string;
  isSending: boolean;
  isLimitReached: boolean;
  onSend: (text?: string, file?: File) => Promise<void>;
  onClearError: () => void;
}

export function useMessageInput({
  inputText,
  isSending,
  isLimitReached,
  onSend,
  onClearError,
}: UseMessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleSend = useCallback(async () => {
    if (isSending || isLimitReached) return;
    if (!inputText.trim() && !pendingFile) return;

    await onSend(inputText, pendingFile ?? undefined);
    setPendingFile(null);
    
    // Restore focus after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [inputText, pendingFile, isSending, isLimitReached, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check 10 MB limit
      if (file.size > 10 * 1024 * 1024) {
        onClearError();
        // Show error inline — handled by parent
        return;
      }

      setPendingFile(file);
      e.target.value = "";
    },
    [onClearError]
  );

  const removePendingFile = useCallback(() => {
    setPendingFile(null);
  }, []);

  return {
    fileInputRef,
    imageInputRef,
    textareaRef,
    pendingFile,
    handleSend,
    handleKeyDown,
    handleFileSelect,
    removePendingFile,
  };
}
