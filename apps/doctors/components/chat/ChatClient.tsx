"use client";

import { useChat } from "./useChat";
import { ConversationList } from "./ConversationList";
import { MessageArea } from "./MessageArea";
import { EmptyChat } from "./EmptyChat";
import { NewChatModal } from "./NewChatModal";
import type { ChatViewProps } from "./chat.types";

export function ChatClient({ dict, lang }: ChatViewProps) {
  const {
    conversations,
    search,
    setSearch,
    isLoading,
    selectedConversationId,
    selectConversation,
    showMessageArea,
    goBackToList,
    showNewChatModal,
    openNewChat,
    closeNewChat,
    onNewChatCreated,
  } = useChat();

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden bg-base-100">
      {/* ── Left panel: Conversation list ────────────────────────────── */}
      <div
        className={`w-full lg:w-80 xl:w-96 shrink-0 border-r border-base-200 ${
          showMessageArea ? "hidden lg:flex lg:flex-col" : "flex flex-col"
        }`}
      >
        <ConversationList
          dict={dict}
          conversations={conversations}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          selectedId={selectedConversationId}
          onSelect={selectConversation}
          onNewChat={openNewChat}
        />
      </div>

      {/* ── Right panel: Message area ─────────────────────────────────── */}
      <div
        className={`flex-1 min-w-0 ${
          showMessageArea ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        }`}
      >
        {selectedConversationId ? (
          <MessageArea
            dict={dict}
            lang={lang}
            conversationId={selectedConversationId}
            onBack={goBackToList}
          />
        ) : (
          <EmptyChat dict={dict} />
        )}
      </div>

      {/* ── New chat modal ────────────────────────────────────────────── */}
      {showNewChatModal && (
        <NewChatModal
          dict={dict}
          onClose={closeNewChat}
          onCreated={onNewChatCreated}
        />
      )}
    </div>
  );
}
