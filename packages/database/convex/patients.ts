import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDoctor = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const doctorClerkId = identity.subject;
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_doctorClerkId", (q) => q.eq("doctorClerkId", doctorClerkId))
      .take(100);
    return patients;
  },
});

export const getById = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.doctorClerkId !== identity.subject) {
      return null;
    }
    return patient;
  },
});

export const create = mutation({
  args: {
    fullName: v.string(),
    age: v.optional(v.number()),
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    lastAppointmentDate: v.optional(v.string()),
    appointmentDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const doctorClerkId = identity.subject;
    return await ctx.db.insert("patients", {
      ...args,
      doctorClerkId,
    });
  },
});

export const update = mutation({
  args: {
    patientId: v.id("patients"),
    fullName: v.string(),
    age: v.optional(v.number()),
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    lastAppointmentDate: v.optional(v.string()),
    appointmentDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.doctorClerkId !== identity.subject) {
      throw new Error("Patient not found or unauthorized");
    }
    const { patientId, ...updates } = args;
    await ctx.db.patch(patientId, updates);
  },
});

export const remove = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.doctorClerkId !== identity.subject) {
      throw new Error("Patient not found or unauthorized");
    }
    await ctx.db.delete(args.patientId);
  },
});
