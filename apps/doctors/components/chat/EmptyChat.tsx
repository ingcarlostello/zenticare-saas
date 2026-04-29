"use client";

import { MessageSquare } from "lucide-react";

interface EmptyChatProps {
  dict: any;
}

export function EmptyChat({ dict }: EmptyChatProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="p-5 rounded-full bg-base-200 mb-4">
        <MessageSquare className="w-10 h-10 opacity-25" />
      </div>
      <p className="text-sm font-medium opacity-50">
        {dict.chat.selectConversation}
      </p>
    </div>
  );
}
