import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertGoogleEvents = mutation({
  args: {
    events: v.array(
      v.object({
        doctorClerkId: v.string(),
        googleEventId: v.string(),
        title: v.string(),
        description: v.string(),
        start: v.number(),
        end: v.number(),
        status: v.string(),
        isAllDay: v.boolean(),
        patientId: v.optional(v.id("patients")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const doctorClerkId = identity.subject;

    for (const event of args.events) {
      if (event.doctorClerkId !== doctorClerkId) continue; // Security check

      // Search if event exists
      const existing = await ctx.db
        .query("appointments")
        .withIndex("by_google_event_id", (q) => q.eq("googleEventId", event.googleEventId))
        .first();

      if (event.status === "cancelled") {
        if (existing) {
          await ctx.db.delete(existing._id);
        }
        continue;
      }

      if (existing) {
        // Update existing, preserving patientId if it was linked locally
        await ctx.db.patch(existing._id, {
          title: event.title,
          description: event.description,
          start: event.start,
          end: event.end,
          isAllDay: event.isAllDay,
          status: "confirmed", // Since it's not cancelled
        });
      } else {
        // Insert new
        await ctx.db.insert("appointments", {
          doctorClerkId: event.doctorClerkId,
          googleEventId: event.googleEventId,
          title: event.title,
          description: event.description,
          start: event.start,
          end: event.end,
          status: "confirmed",
          isAllDay: event.isAllDay,
        });
      }
    }
  },
});

// A query to get just the connected calendar events (or we can use the regular appointments query in the UI)
