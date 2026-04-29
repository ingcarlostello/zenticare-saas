import type { Id, Doc } from "@repo/database/convex/_generated/dataModel";

// ── Conversation ──────────────────────────────────────────────────────────

export interface EnrichedConversation {
  _id: Id<"conversations">;
  _creationTime: number;
  doctorClerkId: string;
  patientId: Id<"patients">;
  lastMessageText?: string;
  lastMessageAt?: number;
  unreadByDoctor?: number;
  unreadByPatient?: number;
  patientName: string;
  patientEmail: string;
}

// ── Message ───────────────────────────────────────────────────────────────

export interface EnrichedMessage {
  _id: Id<"messages">;
  _creationTime: number;
  conversationId: Id<"conversations">;
  senderType: string;
  senderId: string;
  text?: string;
  attachmentStorageId?: Id<"_storage">;
  attachmentType?: string;
  attachmentName?: string;
  attachmentUrl?: string | null;
}

// ── Component props ───────────────────────────────────────────────────────

export interface ChatDict {
  title: string;
  searchPlaceholder: string;
  allConversations: string;
  noConversations: string;
  noConversationsDesc: string;
  newChat: string;
  selectConversation: string;
  typeMessage: string;
  send: string;
  today: string;
  yesterday: string;
  attachFile: string;
  attachImage: string;
  attachmentProOnly: string;
  messageLimitReached: string;
  messageLimitDesc: string;
  messagesRemaining: string;
  upgradeForAttachments: string;
  selectPatient: string;
  noMessages: string;
  imagePreview: string;
  documentAttachment: string;
  downloadFile: string;
  sending: string;
  fileTooLarge: string;
  unsupportedFile: string;
}

export interface ChatViewProps {
  dict: any;
  lang: string;
}

export interface ConversationItemProps {
  conversation: EnrichedConversation;
  isSelected: boolean;
  onClick: () => void;
}

export interface ConversationListProps {
  dict: any;
  conversations: EnrichedConversation[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
  onNewChat: () => void;
}

export interface MessageAreaProps {
  dict: any;
  lang: string;
  conversationId: Id<"conversations">;
  onBack?: () => void;
}

export interface MessageBubbleProps {
  message: EnrichedMessage;
  dict: any;
}

export interface MessageInputProps {
  dict: any;
  lang: string;
  inputText: string;
  onInputChange: (value: string) => void;
  onSend: (text?: string, file?: File) => Promise<void>;
  isSending: boolean;
  uploadingFile: boolean;
  canSendAttachments: boolean;
  isLimitReached: boolean;
  remaining: number;
  isFree: boolean;
  limit: number;
  messageCount: number;
  error: string | null;
  onClearError: () => void;
}

export interface NewChatModalProps {
  dict: any;
  onClose: () => void;
  onCreated: (conversationId: Id<"conversations">) => void;
}

export interface AttachmentPreviewProps {
  message: EnrichedMessage;
  dict: any;
}
