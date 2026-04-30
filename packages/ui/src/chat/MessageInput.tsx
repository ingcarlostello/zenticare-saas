"use client";

import { Send, Paperclip, Image as ImageIcon, Crown, X } from "lucide-react";
import Link from "next/link";
import type { MessageInputProps } from "./chat.types";
import { useMessageInput } from "./useMessageInput";


export function MessageInput({
  dict,
  lang,
  inputText,
  onInputChange,
  onSend,
  isSending,
  uploadingFile,
  canSendAttachments,
  isLimitReached,
  isFree,
  limit,
  messageCount,
  error,
  onClearError,
}: MessageInputProps) {
  const {
    fileInputRef,
    imageInputRef,
    pendingFile,
    handleSend,
    handleKeyDown,
    handleFileSelect,
    removePendingFile,
  } = useMessageInput({
    inputText,
    isSending,
    isLimitReached,
    onSend,
    onClearError,
  });

  // ── Limit reached banner ──
  if (isLimitReached) {
    return (
      <div className="border-t border-base-200 bg-base-100 p-4">
        <div className="flex flex-col items-center gap-2 text-center py-2">
          <Crown className="w-6 h-6 text-warning" />
          <p className="font-semibold text-sm">
            {dict.chat.messageLimitReached}
          </p>
          <p className="text-xs opacity-60 max-w-sm">
            {dict.chat.messageLimitDesc.replace("{limit}", String(limit))}
          </p>
          <Link
            href={`/${lang}/pricing`}
            className="btn btn-primary btn-sm gap-1 mt-1"
          >
            <Crown className="w-3.5 h-3.5" />
            {dict.features?.upgradeBtn ?? "Upgrade to Pro"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-base-200 bg-base-100 shrink-0">
      {/* Error toast */}
      {error && (
        <div className="px-4 pt-2">
          <div className="alert alert-error alert-sm py-1.5 text-xs">
            <span>
              {error === "MESSAGE_LIMIT_REACHED"
                ? dict.chat.messageLimitReached
                : error === "ATTACHMENTS_NOT_AVAILABLE"
                  ? dict.chat.attachmentProOnly
                  : error === "FILE_TOO_LARGE"
                    ? dict.chat.fileTooLarge
                    : dict.chat.unsupportedFile}
            </span>
            <button onClick={onClearError} className="btn btn-ghost btn-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Pending file preview */}
      {pendingFile && (
        <div className="px-4 pt-2 flex items-center gap-2">
          <div className="badge badge-outline badge-sm gap-1 max-w-[200px]">
            <Paperclip className="w-3 h-3 shrink-0" />
            <span className="truncate">{pendingFile.name}</span>
            <button onClick={removePendingFile} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        {/* File attachment button */}
        <div className="tooltip tooltip-top" data-tip={
          canSendAttachments
            ? dict.chat.attachFile
            : dict.chat.upgradeForAttachments
        }>
          <button
            onClick={() => canSendAttachments && fileInputRef.current?.click()}
            className={`btn btn-ghost btn-sm btn-circle ${
              !canSendAttachments ? "opacity-40 cursor-not-allowed" : ""
            }`}
            disabled={!canSendAttachments}
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        {/* Image attachment button */}
        <div className="tooltip tooltip-top" data-tip={
          canSendAttachments
            ? dict.chat.attachImage
            : dict.chat.upgradeForAttachments
        }>
          <button
            onClick={() => canSendAttachments && imageInputRef.current?.click()}
            className={`btn btn-ghost btn-sm btn-circle ${
              !canSendAttachments ? "opacity-40 cursor-not-allowed" : ""
            }`}
            disabled={!canSendAttachments}
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
          onChange={handleFileSelect}
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            className="textarea textarea-bordered w-full text-sm resize-none min-h-[40px] max-h-[120px] pr-12"
            placeholder={dict.chat.typeMessage}
            rows={1}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          {/* Message counter for free plan */}
          {isFree && (
            <span className="absolute bottom-1.5 right-14 text-[10px] opacity-40">
              {messageCount}/{limit === Infinity ? "∞" : limit}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={
            isSending || (!inputText.trim() && !pendingFile) || isLimitReached
          }
          className="btn btn-primary btn-sm btn-circle"
        >
          {isSending || uploadingFile ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
