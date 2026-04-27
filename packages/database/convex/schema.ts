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
  })
    .index("by_doctorClerkId", ["doctorClerkId"])
    .index("by_patientId", ["patientId"])
    .index("by_doctor_and_time", ["doctorClerkId", "start"])
    .index("by_google_event_id", ["googleEventId"]),

  google_calendar_tokens: defineTable({
    doctorId: v.string(), // Clerk userId
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    tokenExpiry: v.number(), // timestamp ms
  }).index("by_doctor", ["doctorId"]),
});
