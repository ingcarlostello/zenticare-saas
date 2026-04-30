"use client";

import { Download, FileText, Image as ImageIcon } from "lucide-react";
import type { EnrichedMessage, AttachmentPreviewProps } from "./chat.types";


export function AttachmentPreview({ message, dict }: AttachmentPreviewProps) {
  if (!message.attachmentStorageId || !message.attachmentUrl) return null;

  const isImage = message.attachmentType === "image";

  if (isImage) {
    return (
      <div className="mt-1.5 max-w-xs">
        <img
          src={message.attachmentUrl}
          alt={message.attachmentName ?? dict.chat.imagePreview}
          className="rounded-lg max-h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(message.attachmentUrl!, "_blank")}
        />
        {message.attachmentName && (
          <p className="text-[10px] opacity-50 mt-0.5 truncate">
            {message.attachmentName}
          </p>
        )}
      </div>
    );
  }

  // PDF or document
  const isPdf = message.attachmentType === "pdf";

  return (
    <a
      href={message.attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200/60 hover:bg-base-200 transition-colors max-w-xs"
    >
      {isPdf ? (
        <FileText className="w-5 h-5 text-error shrink-0" />
      ) : (
        <ImageIcon className="w-5 h-5 text-info shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {message.attachmentName ?? dict.chat.documentAttachment}
        </p>
        <p className="text-[10px] opacity-50">
          {isPdf ? "PDF" : dict.chat.documentAttachment}
        </p>
      </div>
      <Download className="w-3.5 h-3.5 opacity-40 shrink-0" />
    </a>
  );
}
