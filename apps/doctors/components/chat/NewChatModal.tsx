"use client";

import { Search, X, MessageSquarePlus } from "lucide-react";
import type { Id, Doc } from "@repo/database/convex/_generated/dataModel";
import { getInitials } from "./chat.utils";
import type { NewChatModalProps } from "./chat.types";
import { useNewChat } from "./useNewChat";


export function NewChatModal({ dict, onClose, onCreated }: NewChatModalProps) {
  const {
    search,
    setSearch,
    loading,
    isLoadingPatients,
    filtered,
    handleSelect,
  } = useNewChat({ onCreated });

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">{dict.chat.newChat}</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <label className="input input-bordered flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 opacity-50" />
          <input
            type="text"
            className="grow text-sm"
            placeholder={dict.chat.selectPatient}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </label>

        {/* Patient list */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {isLoadingPatients ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm opacity-50 py-6">
              {dict.patients?.noPatients ?? "No patients found"}
            </p>
          ) : (
            filtered.map((patient: Doc<"patients">) => {
              const initials = getInitials(patient.fullName);

              return (
                <button
                  key={patient._id}
                  onClick={() => handleSelect(patient._id)}
                  disabled={loading}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-base-200 transition-colors text-left cursor-pointer"
                >
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-base-200 text-base-content flex items-center justify-center">
                      <span className="text-sm font-bold leading-none mt-[1px]">
                        {initials}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {patient.fullName}
                    </p>
                    <p className="text-xs opacity-50 truncate">
                      {patient.email}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
}
