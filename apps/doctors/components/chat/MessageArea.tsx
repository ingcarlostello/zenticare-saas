"use client";

import { ArrowLeft, MessageCircle } from "lucide-react";
import { useMessages } from "./useMessages";
import { MessageBubble, MessageInput, getInitials, type MessageAreaProps } from "@repo/ui/chat";
import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";


export function MessageArea({
  dict,
  lang,
  conversationId,
  onBack,
}: MessageAreaProps) {
  const conversation = useQuery(api.chat.getConversation, { conversationId });

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
    canSendAttachments,
    isLimitReached,
    isFree,
    limit,
    messageCount,
  } = useMessages(conversationId);

  // Initials for the header avatar
  const patientName = conversation?.patientName ?? "...";
  const initials = getInitials(patientName);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-base-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200">
        {/* Back button — mobile only */}
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
            <span className="text-sm font-bold leading-none mt-[1px]">{initials}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{patientName}</h2>
          <p className="text-xs opacity-50 truncate">
            {conversation?.patientEmail ?? ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-sm opacity-50">{dict.chat.noMessages}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} dict={dict} />
          ))
        )}
      </div>

      {/* Input bar */}
      <MessageInput
        dict={dict}
        lang={lang}
        inputText={inputText}
        onInputChange={setInputText}
        onSend={sendMessage}
        isSending={isSending}
        uploadingFile={uploadingFile}
        canSendAttachments={canSendAttachments}
        isLimitReached={isLimitReached}
        isFree={isFree}
        limit={limit}
        messageCount={messageCount}
        error={error}
        onClearError={() => setError(null)}
      />
    </div>
  );
}
