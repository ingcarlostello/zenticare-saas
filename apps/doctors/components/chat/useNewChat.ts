import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import type { Id, Doc } from "@repo/database/convex/_generated/dataModel";

interface UseNewChatProps {
  onCreated: (conversationId: Id<"conversations">) => void;
}

export function useNewChat({ onCreated }: UseNewChatProps) {
  const patients = useQuery(api.patients.listByDoctor);
  const createConversation = useMutation(api.chat.getOrCreateConversation);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoadingPatients = patients === undefined;

  const filtered = useMemo(() => {
    if (!patients) return [];
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p: Doc<"patients">) =>
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [patients, search]);

  const handleSelect = async (patientId: Id<"patients">) => {
    setLoading(true);
    try {
      const conversationId = await createConversation({ patientId });
      onCreated(conversationId);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    search,
    setSearch,
    loading,
    isLoadingPatients,
    filtered,
    handleSelect,
  };
}
