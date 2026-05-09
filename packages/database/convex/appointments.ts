import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { reminderTranslations } from "./i18n";

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
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
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
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
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

// ---------------------------------------------------------------------------
// cancelAppointment — soft-delete: marks as cancelled + notifies patient
// Only doctors can cancel. This does NOT delete the appointment document.
// ---------------------------------------------------------------------------
export const cancelAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const doctorClerkId = identity.subject;
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || appointment.doctorClerkId !== doctorClerkId) {
      throw new Error("Appointment not found or unauthorized");
    }

    // Can't cancel an already cancelled appointment
    if (appointment.status === "cancelled") {
      throw new Error("Appointment is already cancelled");
    }

    const now = Date.now();

    // 1. Update appointment status to cancelled
    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
      cancelledAt: now,
      cancellationReason: args.reason,
    });

    // 2. Cancel any pending reminder scheduled functions
    await ctx.scheduler.runAfter(
      0,
      internal.appointmentReminders.cancelReminders,
      {
        appointmentId: args.appointmentId,
        scheduleIds: appointment.reminderScheduleIds ?? [],
      }
    );

    // 3. Send cancellation notification to patient via chat (only if linked to a patient)
    if (appointment.patientId) {
      const patient = await ctx.db.get(appointment.patientId);
      if (!patient) return;
      const patientFirstName = patient.fullName.split(" ")[0];

      const doctor = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", doctorClerkId))
        .unique();

      const locale = appointment.locale || "es";
      const t = reminderTranslations[locale] || reminderTranslations.es;
      const doctorName = doctor?.name || doctor?.firstName || t.yourDoctor;

      // Build cancellation message
      let cancelMessage = t.appointmentCancelledByDoctor.replace("{doctorName}", doctorName);
      if (args.reason) {
        cancelMessage += `\n${t.cancelReason}: ${args.reason}`;
      }

      // Get or create conversation
      let conversation = await ctx.db
        .query("conversations")
        .withIndex("by_doctor_and_patient", (q) =>
          q.eq("doctorClerkId", doctorClerkId).eq("patientId", appointment.patientId!)
        )
        .unique();

      let conversationId = conversation?._id;

      if (!conversationId) {
        conversationId = await ctx.db.insert("conversations", {
          doctorClerkId,
          patientId: appointment.patientId,
          unreadByDoctor: 0,
          unreadByPatient: 0,
        });
        conversation = await ctx.db.get(conversationId);
      }

      // Insert the cancellation message
      await ctx.db.insert("messages", {
        conversationId: conversationId!,
        senderType: "system",
        senderId: "system",
        text: cancelMessage,
        messageType: "system",
        appointmentId: args.appointmentId,
        visibility: "patient",
      });

      // Insert message for Doctor
      const doctorCancelMsg = `❌ ${t.cancelNotifyDoctor.replace("{patientName}", patientFirstName)}`;
      await ctx.db.insert("messages", {
        conversationId: conversationId!,
        senderType: "system",
        senderId: "system",
        text: doctorCancelMsg,
        messageType: "system",
        appointmentId: args.appointmentId,
        visibility: "doctor",
      });

      // Update conversation (use doctor text for the list)
      await ctx.db.patch(conversationId!, {
        lastMessageText: doctorCancelMsg.slice(0, 80),
        lastMessageAt: now,
        unreadByPatient: (conversation?.unreadByPatient ?? 0) + 1,
      });
    }
  },
});
