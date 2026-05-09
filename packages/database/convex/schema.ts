import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
    paddleCustomerId: v.optional(v.string()),
    paddleSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    planKey: v.optional(v.string()),
    subscriptionPriceId: v.optional(v.string()),
    subscriptionProductId: v.optional(v.string()),
    subscriptionQuantity: v.optional(v.number()),
    collectionMode: v.optional(v.string()),
    nextBilledAt: v.optional(v.string()),
    scheduledChange: v.optional(v.any()), // Can be more specific if Paddle SDK types are imported, but any is safe here
    canceledAt: v.optional(v.string()),
    pausedAt: v.optional(v.string()),
    subscriptionOccurredAt: v.optional(v.string()),
    messageCount: v.optional(v.number()),
  }).index("by_clerkId", ["clerkId"])
    .index("by_paddleCustomerId", ["paddleCustomerId"]),

  patients: defineTable({
    fullName: v.string(),
    age: v.optional(v.number()),
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    lastAppointmentDate: v.optional(v.string()),
    doctorClerkId: v.string(),
    appointmentDescription: v.optional(v.string()),
  })
    .index("by_doctorClerkId", ["doctorClerkId"])
    .index("by_email_and_doctorClerkId", ["email", "doctorClerkId"]),

  // status: "scheduled" | "confirmed" | "cancelled" | "reschedule_requested"
  appointments: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    start: v.number(),
    end: v.number(),
    patientId: v.optional(v.id("patients")),
    doctorClerkId: v.string(),
    status: v.string(),
    color: v.optional(v.string()),
    googleEventId: v.optional(v.string()),
    isAllDay: v.optional(v.boolean()),
    timezone: v.optional(v.string()), // Added for localized reminders
    locale: v.optional(v.string()),   // Added for localized messages
    // IDs of the 3 scheduled reminder functions — stored so we can cancel them on deletion
    reminderScheduleIds: v.optional(v.array(v.id("_scheduled_functions"))),
    // Confirmation / cancellation tracking (Pro plan only)
    confirmedAt: v.optional(v.number()),        // timestamp when patient confirmed
    cancelledAt: v.optional(v.number()),        // timestamp when doctor cancelled
    cancellationReason: v.optional(v.string()), // optional reason from doctor
  })
    .index("by_doctorClerkId", ["doctorClerkId"])
    .index("by_patientId", ["patientId"])
    .index("by_doctor_and_time", ["doctorClerkId", "start"])
    .index("by_google_event_id", ["googleEventId"]),

  // Log of reminders that have been sent (or should be sent).
  // Serves as the delivery record until a real email/SMS service is wired up.
  reminders_log: defineTable({
    appointmentId: v.id("appointments"),
    patientId: v.id("patients"),
    doctorClerkId: v.string(),
    // "48h_before" | "evening_before" | "2h_before"
    reminderType: v.string(),
    scheduledFor: v.number(), // timestamp ms of when the reminder fires
    firedAt: v.optional(v.number()), // timestamp ms of when it actually ran
    status: v.string(), // "pending" | "fired" | "canceled"
  })
    .index("by_appointment", ["appointmentId"])
    .index("by_doctor", ["doctorClerkId"]),

  google_calendar_tokens: defineTable({
    doctorId: v.string(), // Clerk userId
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    tokenExpiry: v.number(), // timestamp ms
  }).index("by_doctor", ["doctorId"]),

  // ── Chat ────────────────────────────────────────────────────────────────
  // One conversation per doctor-patient pair.
  // Denormalized last-message fields power the conversation list without
  // needing to scan the messages table.
  conversations: defineTable({
    doctorClerkId: v.string(),
    patientId: v.id("patients"),
    lastMessageText: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    unreadByDoctor: v.optional(v.number()),
    unreadByPatient: v.optional(v.number()),
  })
    .index("by_doctor", ["doctorClerkId"])
    .index("by_doctor_and_patient", ["doctorClerkId", "patientId"])
    .index("by_doctor_and_lastMessage", ["doctorClerkId", "lastMessageAt"])
    .index("by_patient", ["patientId"]),

  // Individual chat messages.
  // senderType: "doctor" | "patient" | "system"
  // senderId: doctorClerkId (string) when doctor, or patientId (Id<"patients">) when patient
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderType: v.string(),
    senderId: v.string(),
    text: v.optional(v.string()),
    // Attachments (Pro+ only for doctors)
    attachmentStorageId: v.optional(v.id("_storage")),
    attachmentType: v.optional(v.string()),   // "image" | "pdf" | "document"
    attachmentName: v.optional(v.string()),   // original file name
    // Interactive message support (reminder confirmations — Pro plan)
    messageType: v.optional(v.string()),         // "text" | "reminder_confirmation" | "system"
    appointmentId: v.optional(v.id("appointments")), // linked appointment for interactive msgs
    reminderActions: v.optional(v.array(v.object({
      actionId: v.string(),   // "confirm" | "reschedule"
      label: v.string(),      // localized button label
      style: v.string(),      // "primary" | "ghost" | "outline"
    }))),
    reminderResponse: v.optional(v.string()),    // "confirmed" | "reschedule_requested"
    respondedAt: v.optional(v.number()),         // when the patient tapped a button
    visibility: v.optional(v.string()),          // "all" | "doctor" | "patient"
  })
    .index("by_conversation", ["conversationId"]),
});
