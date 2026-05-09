"use client";

import { AttachmentPreview } from "./AttachmentPreview";
import type { MessageBubbleProps } from "./chat.types";
import { formatMessageTime } from "./chat.utils";


export function MessageBubble({
  message,
  dict,
  currentUserType = "doctor",
  onRespondToReminder,
  isRespondingToReminder,
}: MessageBubbleProps) {
  const isSystem = message.senderType === "system" || message.messageType === "system";
  const isCurrentUser = !isSystem && message.senderType === currentUserType;
  const time = formatMessageTime(message._creationTime);

  // Visibility check: Hide messages that are not meant for the current user
  if (message.visibility && message.visibility !== "all" && message.visibility !== currentUserType) {
    return null;
  }

  // System messages (confirmations, cancellations) — centered, subtle
  if (isSystem) {
    return (
      <div className="flex justify-center mb-3">
        <div className="bg-base-200/60 text-base-content/70 rounded-xl px-4 py-2 max-w-[85%] sm:max-w-[70%] text-center">
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          <div className="text-[10px] mt-1 opacity-40">{time}</div>
        </div>
      </div>
    );
  }

  // Check if this is an interactive reminder that needs buttons
  const hasActions =
    message.messageType === "reminder_confirmation" &&
    message.reminderActions &&
    message.reminderActions.length > 0;
  const hasResponded = !!message.reminderResponse;

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] ${
          isCurrentUser
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

        {/* Interactive Reminder Buttons (patient side only) */}
        {hasActions && !hasResponded && currentUserType === "patient" && (
          <div className="mt-3 flex flex-col gap-2">
            {message.reminderActions!.map((action) => {
              const isConfirm = action.actionId === "confirm";
              return (
                <button
                  key={action.actionId}
                  onClick={() => onRespondToReminder?.(message._id, action.actionId)}
                  disabled={isRespondingToReminder}
                  className={`
                    btn btn-sm transition-all duration-200
                    ${isConfirm
                      ? "btn-success text-success-content font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] animate-pulse-subtle"
                      : "btn-ghost btn-outline text-xs font-medium opacity-80 hover:opacity-100"
                    }
                    ${isRespondingToReminder ? "loading" : ""}
                  `}
                >
                  {isRespondingToReminder ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    action.label
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Show response badge after patient responded (visible to both sides) */}
        {hasActions && hasResponded && (
          <div className="mt-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                message.reminderResponse === "confirmed"
                  ? "bg-success/20 text-success"
                  : "bg-warning/20 text-warning"
              }`}
            >
              {message.reminderResponse === "confirmed"
                ? dict.chat?.appointmentConfirmed ?? "Appointment confirmed ✅"
                : dict.chat?.rescheduleRequested ?? "Reschedule requested 📅"}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-1 ${
            isCurrentUser ? "text-primary-content/60" : "opacity-40"
          } text-right`}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
