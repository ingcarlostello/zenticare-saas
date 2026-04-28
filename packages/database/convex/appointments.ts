import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const listByDoctor = query({
  args: {
    start: v.optional(v.number()),
    end: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const doctorClerkId = identity.subject;

    // For now we load all appointments for the doctor or filter manually if dates are provided
    // In a real large app we'd use indexes or paginate, but since we need them all for the calendar:
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctorClerkId", (q) => q.eq("doctorClerkId", doctorClerkId))
      .collect();

    // Filter by date range if provided
    if (args.start && args.end) {
      return appointments.filter(
        (app) => app.start >= args.start! && app.end <= args.end!
      );
    }

    return appointments;
  },
});

export const getById = query({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || appointment.doctorClerkId !== identity.subject) {
      return null;
    }
    return appointment;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    start: v.number(),
    end: v.number(),
    patientId: v.id("patients"),
    status: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const doctorClerkId = identity.subject;

    // Verify patient belongs to this doctor
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.doctorClerkId !== doctorClerkId) {
      throw new Error("Patient not found or unauthorized");
    }

    const appointmentId = await ctx.db.insert("appointments", {
      ...args,
      doctorClerkId,
    });

    // Resolve the doctor's planKey to pass to the reminder scheduler
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", doctorClerkId))
      .unique();
    const planKey = user?.planKey ?? "free";

    // Schedule the 3 patient reminders (no-op for free plan)
    await ctx.scheduler.runAfter(
      0,
      internal.appointmentReminders.scheduleReminders,
      { appointmentId, doctorClerkId, planKey }
    );

    return appointmentId;
  },
});

export const update = mutation({
  args: {
    appointmentId: v.id("appointments"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    patientId: v.optional(v.id("patients")),
    status: v.optional(v.string()),
    color: v.optional(v.string()),
    googleEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || appointment.doctorClerkId !== identity.subject) {
      throw new Error("Appointment not found or unauthorized");
    }

    const { appointmentId, ...updates } = args;

    if (updates.patientId) {
      const patient = await ctx.db.get(updates.patientId);
      if (!patient || patient.doctorClerkId !== identity.subject) {
        throw new Error("Patient not found or unauthorized");
      }
    }

    await ctx.db.patch(appointmentId, updates);
  },
});

export const remove = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || appointment.doctorClerkId !== identity.subject) {
      throw new Error("Appointment not found or unauthorized");
    }

    // Cancel any pending reminder scheduled functions before deleting
    // We pass the schedule IDs so the internal mutation doesn't need to read the deleted appointment
    await ctx.scheduler.runAfter(
      0,
      internal.appointmentReminders.cancelReminders,
      { 
        appointmentId: args.appointmentId,
        scheduleIds: appointment.reminderScheduleIds ?? []
      }
    );

    await ctx.db.delete(args.appointmentId);
  },
});
