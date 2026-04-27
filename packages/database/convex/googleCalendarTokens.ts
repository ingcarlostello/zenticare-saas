import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const hasGoogleConnected = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false; // Not authenticated
    }

    const doctorClerkId = identity.subject;

    // Search for tokens for this doctor
    const tokens = await ctx.db
      .query("google_calendar_tokens")
      .withIndex("by_doctor", (q) => q.eq("doctorId", doctorClerkId))
      .first();

    return tokens !== null;
  },
});

export const saveTokens = mutation({
  args: {
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    tokenExpiry: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const doctorClerkId = identity.subject;

    const existing = await ctx.db
      .query("google_calendar_tokens")
      .withIndex("by_doctor", (q) => q.eq("doctorId", doctorClerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        encryptedAccessToken: args.encryptedAccessToken,
        encryptedRefreshToken: args.encryptedRefreshToken,
        tokenExpiry: args.tokenExpiry,
      });
    } else {
      await ctx.db.insert("google_calendar_tokens", {
        doctorId: doctorClerkId,
        encryptedAccessToken: args.encryptedAccessToken,
        encryptedRefreshToken: args.encryptedRefreshToken,
        tokenExpiry: args.tokenExpiry,
      });
    }
  },
});

export const deleteTokens = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const doctorClerkId = identity.subject;

    const existing = await ctx.db
      .query("google_calendar_tokens")
      .withIndex("by_doctor", (q) => q.eq("doctorId", doctorClerkId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getTokens = internalQuery({
  args: { doctorClerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("google_calendar_tokens")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorClerkId))
      .first();
  },
});


