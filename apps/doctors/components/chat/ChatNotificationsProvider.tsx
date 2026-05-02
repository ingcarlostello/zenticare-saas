"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import { useConversations } from "./useConversations";
import type { Id } from "@repo/database/convex/_generated/dataModel";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: Id<"conversations">;
  unreadCount: number;
  lastMessageAt: number;
}

interface ChatNotificationsContextType {
  activeConversationId: Id<"conversations"> | null;
  setActiveConversationId: (id: Id<"conversations"> | null) => void;
  isUserChatting: boolean;
  setIsUserChatting: (chatting: boolean) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const ChatNotificationsContext = createContext<
  ChatNotificationsContextType | undefined
>(undefined);

export function useChatNotifications() {
  const context = useContext(ChatNotificationsContext);
  if (!context) {
    throw new Error(
      "useChatNotifications must be used within a ChatNotificationsProvider"
    );
  }
  return context;
}

// ── Provider ───────────────────────────────────────────────────────────────────

const AUDIO_SRC = "/notificationChat.MP3";

export function ChatNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname?.includes("/chat") ?? false;

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeConversationId, setActiveConversationId] =
    useState<Id<"conversations"> | null>(null);
  
  // Kept for backward compatibility with existing hooks
  const [isUserChatting, setIsUserChatting] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Map<conversationId, NotificationItem> for O(1) lookup
  const snapshotRef = useRef<Map<string, NotificationItem>>(new Map());
  const isEnabled = true; // Can be wired to a user preference in the future

  // ── Load audio on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audioRef.current = null;
    };
  }, []);

  // ── Play function (robust, async) ──────────────────────────────────────────
  const playNotificationSilently = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      await audio.play();
    } catch {
      // Browser policy may block autoplay — silently ignore
    }
  }, []);

  // ── Conversations data ─────────────────────────────────────────────────────
  const { allConversations } = useConversations();

  // Map conversations → lightweight notification items
  const notificationItems = useMemo<NotificationItem[]>(
    () =>
      allConversations.map((c) => ({
        id: c._id,
        unreadCount: c.unreadByDoctor ?? 0,
        lastMessageAt: c.lastMessageAt ?? 0,
      })),
    [allConversations]
  );

  // ── Detect new messages and trigger sound ──────────────────────────────────
  useEffect(() => {
    if (!isEnabled) return;

    let shouldNotify = false;
    const isFocused = document.hasFocus();

    for (const item of notificationItems) {
      const prev = snapshotRef.current.get(item.id);

      // No previous snapshot yet — just record and move on
      if (!prev) continue;

      const nextUnread = item.unreadCount;
      const nextLast = item.lastMessageAt;

      // 🔥 KEY CONDITION: new unread AND more recent message
      if (nextUnread > prev.unreadCount && nextLast > prev.lastMessageAt) {
        // If we are on the chat page, check if this is the active conversation
        if (isChatPage && activeConversationId === item.id) {
          // User has this chat open. Sound depends on whether the browser has focus.
          if (isFocused) {
            continue; // They are looking at the message, no sound.
          } else {
            // Browser doesn't have focus, make a sound!
            shouldNotify = true;
            break;
          }
        }

        // Otherwise (different chat, or different page), make a sound!
        shouldNotify = true;
        break;
      }
    }

    if (shouldNotify) {
      void playNotificationSilently();
    }

    // Update snapshot AFTER comparison
    const nextSnapshot = new Map<string, NotificationItem>();
    for (const item of notificationItems) {
      nextSnapshot.set(item.id, item);
    }
    snapshotRef.current = nextSnapshot;
  }, [
    notificationItems,
    activeConversationId,
    isChatPage,
    isEnabled,
    playNotificationSilently,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ChatNotificationsContext.Provider
      value={{
        activeConversationId,
        setActiveConversationId,
        isUserChatting,
        setIsUserChatting,
      }}
    >
      {children}
    </ChatNotificationsContext.Provider>
  );
}
