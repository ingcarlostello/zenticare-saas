import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const schedule = await ctx.db
      .query("schedules")
      .withIndex("by_doctorClerkId", (q) => q.eq("doctorClerkId", identity.subject))
      .first();

    return schedule;
  },
});

export const update = mutation({
  args: {
    appointmentDuration: v.number(),
    weeklyAvailability: v.array(
      v.object({
        day: v.string(),
        isActive: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
        breaks: v.array(
          v.object({
            name: v.string(),
            startTime: v.string(),
            endTime: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existingSchedule = await ctx.db
      .query("schedules")
      .withIndex("by_doctorClerkId", (q) => q.eq("doctorClerkId", identity.subject))
      .first();

    if (existingSchedule) {
      await ctx.db.patch(existingSchedule._id, {
        appointmentDuration: args.appointmentDuration,
        weeklyAvailability: args.weeklyAvailability,
      });
      return existingSchedule._id;
    } else {
      const newId = await ctx.db.insert("schedules", {
        doctorClerkId: identity.subject,
        appointmentDuration: args.appointmentDuration,
        weeklyAvailability: args.weeklyAvailability,
      });
      return newId;
    }
  },
});
