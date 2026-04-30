"use client";

import type { EnrichedConversation, ConversationItemProps } from "@repo/ui/chat";
import { formatRelativeTime, getInitials } from "@repo/ui/chat";


export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const unread = conversation.unreadByDoctor ?? 0;

  // Format timestamp
  const timeLabel = conversation.lastMessageAt
    ? formatRelativeTime(conversation.lastMessageAt)
    : "";

  // Initials for avatar
  const initials = getInitials(conversation.patientName);

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-left transition-colors duration-150 cursor-pointer ${
        isSelected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-base-200 border border-transparent"
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center ${
            isSelected
              ? "bg-primary text-primary-content"
              : "bg-base-300 text-base-content"
          }`}
        >
          <span className="text-sm font-bold leading-none mt-[1px]">{initials}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm truncate">
            {conversation.patientName}
          </span>
          {timeLabel && (
            <span className="text-xs opacity-50 shrink-0">{timeLabel}</span>
          )}
        </div>
        <p className="text-xs opacity-60 truncate mt-0.5">
          {conversation.lastMessageText || "—"}
        </p>
      </div>

      {/* Unread badge */}
      {unread > 0 && (
        <div className="badge badge-primary badge-sm shrink-0">{unread}</div>
      )}
    </button>
  );
}
