"use client";

import { Search, Plus } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import type { ConversationListProps } from "@repo/ui/chat";


export function ConversationList({
  dict,
  conversations,
  isLoading,
  search,
  onSearchChange,
  selectedId,
  onSelect,
  onNewChat,
}: ConversationListProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-base-100">
      {/* Search bar + new chat button */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1">
          <Search className="w-3.5 h-3.5 opacity-50" />
          <input
            type="text"
            className="grow text-sm"
            placeholder={dict.chat.searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
        <button
          onClick={onNewChat}
          className="btn btn-primary btn-sm btn-square"
          title={dict.chat.newChat}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* "All" label */}
      <div className="px-4 py-1.5">
        <span className="text-xs font-semibold uppercase opacity-50 tracking-wider">
          {dict.chat.allConversations}
        </span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-sm font-medium opacity-60">
              {dict.chat.noConversations}
            </p>
            <p className="text-xs opacity-40 mt-1">
              {dict.chat.noConversationsDesc}
            </p>
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c._id}
              conversation={c}
              isSelected={c._id === selectedId}
              onClick={() => onSelect(c._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
