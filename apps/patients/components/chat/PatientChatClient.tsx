"use client";

import { MessageCircle } from "lucide-react";
import { MessageBubble, MessageInput, getInitials } from "@repo/ui/chat";
import { usePatientMessages } from "./usePatientMessages";
import type { Id } from "@repo/database/convex/_generated/dataModel";

export function PatientChatClient({ 
  dict, 
  lang, 
  patientId 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: { chat: any }; 
  lang: string; 
  patientId: string;
}) {
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

  const doctorName = conversation?.doctorName ?? dict.chat?.doctor ?? "Doctor";
  const initials = getInitials(doctorName);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-base-100 max-w-4xl mx-auto w-full lg:border-x border-base-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200 bg-base-100/50 backdrop-blur-md sticky top-0 z-10">
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
            <span className="text-sm font-bold leading-none mt-[1px]">{initials}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{doctorName}</h2>
          <p className="text-xs opacity-50 truncate text-success font-medium">
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 bg-base-200/30">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-12 h-12 opacity-20 mb-3 text-primary" />
            <h3 className="font-semibold text-lg">{dict.chat?.noMessages ?? "No messages yet"}</h3>
            <p className="text-sm opacity-60 mt-1 max-w-sm">
              {dict.chat?.startChatWithDoctor ?? "Send a message to start conversing with your doctor."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 mt-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg._id} message={msg} dict={dict} currentUserType="patient" />
            ))}
          </div>
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
        uploadingFile={!!uploadingFile}
        canSendAttachments={true} // The server will reject if doctor's plan doesn't allow it
        isLimitReached={error === "MESSAGE_LIMIT_REACHED"}
        isFree={false} 
        limit={Infinity}
        messageCount={0}
        error={error}
        onClearError={() => setError(null)}
      />
    </div>
  );
}
