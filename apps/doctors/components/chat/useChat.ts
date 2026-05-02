"use client";

import { useState, useCallback } from "react";
import type { Id } from "@repo/database/convex/_generated/dataModel";
import { useConversations } from "./useConversations";
import { useChatNotifications } from "./ChatNotificationsProvider";

export function useChat() {
  const conversationState = useConversations();
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  // Mobile: whether the message area is shown (hides conversation list)
  const [showMessageArea, setShowMessageArea] = useState(false);

  const { setActiveConversationId, setIsUserChatting } = useChatNotifications();

  const selectConversation = useCallback(
    (id: Id<"conversations">) => {
      setSelectedConversationId(id);
      setShowMessageArea(true);
      setActiveConversationId(id);
      setIsUserChatting(false);
    },
    [setActiveConversationId, setIsUserChatting]
  );

  const goBackToList = useCallback(() => {
    setShowMessageArea(false);
    // Clear active conversation so notifications work when no chat is selected
    setActiveConversationId(null);
    setIsUserChatting(false);
  }, [setActiveConversationId, setIsUserChatting]);

  const openNewChat = useCallback(() => setShowNewChatModal(true), []);
  const closeNewChat = useCallback(() => setShowNewChatModal(false), []);

  // After a new chat is created, select it
  const onNewChatCreated = useCallback((conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
    setShowNewChatModal(false);
    setShowMessageArea(true);
    setActiveConversationId(conversationId);
    setIsUserChatting(false);
  }, [setActiveConversationId, setIsUserChatting]);

  return {
    ...conversationState,
    selectedConversationId,
    selectConversation,
    showMessageArea,
    goBackToList,
    showNewChatModal,
    openNewChat,
    closeNewChat,
    onNewChatCreated,
  };
}
