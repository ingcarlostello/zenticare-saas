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
});
