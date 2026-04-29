"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import type { EnrichedConversation } from "./chat.types";

export function useConversations() {
  const raw = useQuery(api.chat.listConversations);
  const [search, setSearch] = useState("");

  const isLoading = raw === undefined;
  const conversations: EnrichedConversation[] = raw ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.patientName.toLowerCase().includes(q) ||
        c.patientEmail.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unreadByDoctor ?? 0), 0),
    [conversations]
  );

  return {
    conversations: filtered,
    allConversations: conversations,
    search,
    setSearch,
    isLoading,
    totalUnread,
  };
}
