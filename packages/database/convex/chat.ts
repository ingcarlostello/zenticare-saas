import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getFeatureLimit, hasFeature } from "./plans";

// ── Queries ────────────────────────────────────────────────────────────────

/** List all conversations for the authenticated doctor, sorted by most recent. */
export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const doctorClerkId = identity.subject;

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_doctor_and_lastMessage", (q) =>
        q.eq("doctorClerkId", doctorClerkId)
      )
      .order("desc")
      .take(100);

    // Enrich each conversation with patient data
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const patient = await ctx.db.get(conv.patientId);
        return {
          ...conv,
          patientName: patient?.fullName ?? "Unknown",
          patientEmail: patient?.email ?? "",
        };
      })
    );

    return enriched;
  },
});

/** List messages for a conversation (most recent first, paginated). */
export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Verify ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.doctorClerkId !== identity.subject) {
      return [];
    }

    const limit = args.limit ?? 50;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);

    // Resolve attachment URLs
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        let attachmentUrl: string | null = null;
        if (msg.attachmentStorageId) {
          attachmentUrl = await ctx.storage.getUrl(msg.attachmentStorageId);
        }
        return { ...msg, attachmentUrl };
      })
    );

    return enriched;
  },
});

/** Get a single conversation by ID (with patient data). */
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.doctorClerkId !== identity.subject) {
      return null;
    }

    const patient = await ctx.db.get(conversation.patientId);
    return {
      ...conversation,
      patientName: patient?.fullName ?? "Unknown",
      patientEmail: patient?.email ?? "",
    };
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

/** Get or create a conversation with a specific patient. */
export const getOrCreateConversation = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const doctorClerkId = identity.subject;

    // Check if patient belongs to this doctor
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.doctorClerkId !== doctorClerkId) {
      throw new Error("Patient not found");
    }

    // Look for existing conversation
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_doctor_and_patient", (q) =>
        q.eq("doctorClerkId", doctorClerkId).eq("patientId", args.patientId)
      )
      .unique();

    if (existing) return existing._id;

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      doctorClerkId,
      patientId: args.patientId,
      unreadByDoctor: 0,
      unreadByPatient: 0,
    });

    return conversationId;
  },
});

/** Send a message from the doctor. Enforces plan limits atomically. */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.optional(v.string()),
    attachmentStorageId: v.optional(v.id("_storage")),
    attachmentType: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const doctorClerkId = identity.subject;

    // Verify conversation ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.doctorClerkId !== doctorClerkId) {
      throw new Error("Conversation not found");
    }

    // ── Feature guard: message limit ──────────────────────────────────
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", doctorClerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const planKey = user.planKey ?? "free";
    const limit = getFeatureLimit(planKey, "chat_messages");
    const currentCount = user.messageCount ?? 0;

    if (currentCount >= limit) {
      throw new Error("MESSAGE_LIMIT_REACHED");
    }

    // ── Feature guard: attachments ────────────────────────────────────
    if (args.attachmentStorageId && !hasFeature(planKey, "chat_attachments")) {
      throw new Error("ATTACHMENTS_NOT_AVAILABLE");
    }

    // Must have either text or attachment
    if (!args.text && !args.attachmentStorageId) {
      throw new Error("Message must have text or attachment");
    }

    // ── Insert message ────────────────────────────────────────────────
    const now = Date.now();

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderType: "doctor",
      senderId: doctorClerkId,
      text: args.text,
      attachmentStorageId: args.attachmentStorageId,
      attachmentType: args.attachmentType,
      attachmentName: args.attachmentName,
    });

    // ── Atomically increment messageCount ──────────────────────────────
    await ctx.db.patch(user._id, {
      messageCount: currentCount + 1,
    });

    // ── Update conversation denormalized fields ───────────────────────
    const previewText =
      args.text?.slice(0, 80) ?? `📎 ${args.attachmentName ?? "File"}`;

    await ctx.db.patch(args.conversationId, {
      lastMessageText: previewText,
      lastMessageAt: now,
      unreadByPatient: (conversation.unreadByPatient ?? 0) + 1,
    });

    return { success: true };
  },
});

/** Mark a conversation as read by the doctor. */
export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.doctorClerkId !== identity.subject) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(args.conversationId, { unreadByDoctor: 0 });
  },
});

/** Generate an upload URL for file attachments (Pro+ only). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Feature guard
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const planKey = user.planKey ?? "free";
    if (!hasFeature(planKey, "chat_attachments")) {
      throw new Error("ATTACHMENTS_NOT_AVAILABLE");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/** Get a signed URL for a stored file. */
export const getAttachmentUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ── Patient Unauthenticated Endpoints ──────────────────────────────────────
// NOTE: These endpoints are currently unauthenticated for patient access during development.
// They rely on the provided patientId. Once patient login is implemented, these should
// be updated to verify the identity securely.

/** Get the patient's conversation with their doctor. */
export const patientGetConversation = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    if (!patient) return null;

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_doctor_and_patient", (q) =>
        q.eq("doctorClerkId", patient.doctorClerkId).eq("patientId", args.patientId)
      )
      .unique();

    if (!conversation) return null;

    const doctor = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", patient.doctorClerkId))
      .unique();

    return {
      ...conversation,
      doctorName: doctor?.name ?? doctor?.firstName ?? "Doctor",
    };
  },
});

/** Get or create the patient's conversation with their doctor. */
export const patientGetOrCreateConversation = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found");

    const doctorClerkId = patient.doctorClerkId;

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_doctor_and_patient", (q) =>
        q.eq("doctorClerkId", doctorClerkId).eq("patientId", args.patientId)
      )
      .unique();

    if (existing) return existing._id;

    const conversationId = await ctx.db.insert("conversations", {
      doctorClerkId,
      patientId: args.patientId,
      unreadByDoctor: 0,
      unreadByPatient: 0,
    });

    return conversationId;
  },
});

/** List messages for a conversation from the patient's side. */
export const patientListMessages = query({
  args: {
    conversationId: v.id("conversations"),
    patientId: v.id("patients"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.patientId !== args.patientId) {
      return [];
    }

    const limit = args.limit ?? 50;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);

    // Resolve attachment URLs
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        let attachmentUrl: string | null = null;
        if (msg.attachmentStorageId) {
          attachmentUrl = await ctx.storage.getUrl(msg.attachmentStorageId);
        }
        return { ...msg, attachmentUrl };
      })
    );

    return enriched;
  },
});

/** Send a message from the patient. Enforces the DOCTOR'S plan limits atomically. */
export const patientSendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    patientId: v.id("patients"),
    text: v.optional(v.string()),
    attachmentStorageId: v.optional(v.id("_storage")),
    attachmentType: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify conversation ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.patientId !== args.patientId) {
      throw new Error("Conversation not found");
    }

    const doctorClerkId = conversation.doctorClerkId;

    // ── Feature guard: message limit (checking doctor's plan) ──────────
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", doctorClerkId))
      .unique();

    if (!user) throw new Error("Doctor not found");

    const planKey = user.planKey ?? "free";
    const limit = getFeatureLimit(planKey, "chat_messages");
    const currentCount = user.messageCount ?? 0;

    if (currentCount >= limit) {
      throw new Error("MESSAGE_LIMIT_REACHED");
    }

    // ── Feature guard: attachments ────────────────────────────────────
    if (args.attachmentStorageId && !hasFeature(planKey, "chat_attachments")) {
      throw new Error("ATTACHMENTS_NOT_AVAILABLE");
    }

    // Must have either text or attachment
    if (!args.text && !args.attachmentStorageId) {
      throw new Error("Message must have text or attachment");
    }

    // ── Insert message ────────────────────────────────────────────────
    const now = Date.now();

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderType: "patient",
      senderId: args.patientId,
      text: args.text,
      attachmentStorageId: args.attachmentStorageId,
      attachmentType: args.attachmentType,
      attachmentName: args.attachmentName,
    });

    // ── Atomically increment doctor's messageCount ─────────────────────
    await ctx.db.patch(user._id, {
      messageCount: currentCount + 1,
    });

    // ── Update conversation denormalized fields ───────────────────────
    const previewText =
      args.text?.slice(0, 80) ?? `📎 ${args.attachmentName ?? "File"}`;

    await ctx.db.patch(args.conversationId, {
      lastMessageText: previewText,
      lastMessageAt: now,
      unreadByDoctor: (conversation.unreadByDoctor ?? 0) + 1,
    });

    return { success: true };
  },
});

/** Mark a conversation as read by the patient. */
export const patientMarkAsRead = mutation({
  args: { 
    conversationId: v.id("conversations"),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.patientId !== args.patientId) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(args.conversationId, { unreadByPatient: 0 });
  },
});

/** Generate an upload URL for file attachments (Pro+ only, checking doctor's plan). */
export const patientGenerateUploadUrl = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found");

    // Feature guard: check doctor's plan
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", patient.doctorClerkId))
      .unique();

    if (!user) throw new Error("Doctor not found");

    const planKey = user.planKey ?? "free";
    if (!hasFeature(planKey, "chat_attachments")) {
      throw new Error("ATTACHMENTS_NOT_AVAILABLE");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
