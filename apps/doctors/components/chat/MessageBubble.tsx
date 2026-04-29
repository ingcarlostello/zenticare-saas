"use client";

import { AttachmentPreview } from "./AttachmentPreview";
import type { EnrichedMessage, MessageBubbleProps } from "./chat.types";
import { formatMessageTime } from "./chat.utils";


export function MessageBubble({ message, dict }: MessageBubbleProps) {
  const isDoctor = message.senderType === "doctor";

  const time = formatMessageTime(message._creationTime);

  return (
    <div className={`flex ${isDoctor ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] ${
          isDoctor
            ? "bg-primary text-primary-content rounded-2xl rounded-br-md"
            : "bg-base-200 text-base-content rounded-2xl rounded-bl-md"
        } px-4 py-2.5 shadow-sm`}
      >
        {/* Text */}
        {message.text && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}

        {/* Attachment */}
        <AttachmentPreview message={message} dict={dict} />

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-1 ${
            isDoctor ? "text-primary-content/60" : "opacity-40"
          } text-right`}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
