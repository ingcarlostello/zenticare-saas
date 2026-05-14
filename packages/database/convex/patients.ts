import { query, mutation, internalMutation } from "./_generated/server";
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

    // Check if patient with this email already exists
    const existing = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      if (!existing.doctorClerkId) {
        // Patient self-registered first. Link them to this doctor.
        await ctx.db.patch(existing._id, {
          ...args,
          doctorClerkId,
        });
        return existing._id;
      } else if (existing.doctorClerkId === doctorClerkId) {
        throw new Error("Patient already exists in your list.");
      }
      // If belongs to another doctor, we fall through and create a new record.
      // Note: clerk webhook might need to handle multiple records in the future.
    }

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

// ── Webhook-driven internal mutations ─────────────────────────────────

/**
 * Called by the Clerk webhook when a patient registers (user.created with role=patient).
 * If a patient record exists with the same email (created by a doctor), links the Clerk identity.
 * If no record exists, creates a new patient entry in the patients table.
 */
export const linkPatientClerkId = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    // Look for an existing patient record created by a doctor
    const patient = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (patient) {
      // Link Clerk identity to the existing patient record
      await ctx.db.patch(patient._id, { clerkId: args.clerkId });
      console.log(`Linked clerkId ${args.clerkId} to existing patient ${patient._id} (${args.email})`);
    } else {
      // Self-registration: create a new patient record
      const newId = await ctx.db.insert("patients", {
        clerkId: args.clerkId,
        email: args.email,
        fullName: args.fullName,
      });
      console.log(`Created new patient ${newId} for clerkId ${args.clerkId} (${args.email})`);
    }
  },
});

/**
 * Called by the Clerk webhook when a patient updates their profile (user.updated).
 * Updates name and email on the patient record if it exists.
 */
export const updatePatientByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (patient) {
      await ctx.db.patch(patient._id, {
        email: args.email,
        fullName: args.fullName,
      });
    }
  },
});

/**
 * Called by the Clerk webhook when a patient deletes their account (user.deleted).
 * Removes the clerkId from the patient record (does NOT delete the patient).
 */
export const unlinkPatientClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (patient) {
      await ctx.db.patch(patient._id, { clerkId: undefined });
      console.log(`Unlinked clerkId ${args.clerkId} from patient ${patient._id}`);
    }
  },
});
