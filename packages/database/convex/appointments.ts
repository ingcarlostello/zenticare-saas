import { query, mutation } from "./_generated/server";
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

    return await ctx.db.insert("appointments", {
      ...args,
      doctorClerkId,
    });
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
    await ctx.db.delete(args.appointmentId);
  },
});
