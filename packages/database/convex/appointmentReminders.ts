/**
 * Appointment Reminder — Scheduled Functions
 *
 * All scheduling logic is isolated here. Only Pro-plan doctors get reminders.
 *
 * Three reminders are created per appointment:
 *  1. "48h_before"      — same clock time, 2 days prior
 *  2. "evening_before"  — 20:00 (8 PM) the night before
 *  3. "2h_before"       — 2 hours before the appointment start
 *
 * The actual delivery is recorded in the `reminders_log` table.
 * A real email/SMS service can be plugged in later inside `sendReminder`.
 *
 * Interactive behaviour (Pro plan):
 *  - The 48h reminder includes confirmation buttons (Confirm / Reschedule).
 *  - If the patient confirms, subsequent reminders are sent WITHOUT buttons.
 *  - If the appointment is cancelled, remaining reminders are NOT sent.
 */

import { reminderTranslations } from "./i18n";

import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { hasFeature } from "./plans";

// ---------------------------------------------------------------------------
// Helper — compute the 3 reminder timestamps for a given appointment start
// ---------------------------------------------------------------------------
function computeReminderTimes(
  appointmentStart: number
): Record<string, number> {
  const startDate = new Date(appointmentStart);

  // 1. 48 hours before (exact same clock time, 2 days prior)
  const fortyEightHoursBefore = appointmentStart - 48 * 60 * 60 * 1000;

  // 2. Evening before at 20:00 (8 PM) in local wall-clock sense
  //    We build a date set to the previous calendar day at 20:00 UTC.
  //    NOTE: Convex runs in UTC. If your users are in a specific timezone,
  //    adjust the offset here or pass timezone as a param in the future.
  const eveningBefore = new Date(startDate);
  eveningBefore.setUTCDate(eveningBefore.getUTCDate() - 1);
  eveningBefore.setUTCHours(20, 0, 0, 0);

  // 3. 2 hours before
  const twoHoursBefore = appointmentStart - 2 * 60 * 60 * 1000;

  return {
    "48h_before": fortyEightHoursBefore,
    evening_before: eveningBefore.getTime(),
    "2h_before": twoHoursBefore,
  };
}

// ---------------------------------------------------------------------------
// sendReminder — the handler that fires at the scheduled time
// ---------------------------------------------------------------------------
export const sendReminder = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
    patientId: v.id("patients"),
    doctorClerkId: v.string(),
    reminderType: v.string(),
    scheduledFor: v.number(),
    reminderLogId: v.id("reminders_log"),
  },
  handler: async (ctx, args) => {
    // Verify the appointment still exists (could have been deleted)
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      // Appointment was deleted — the reminders_log entry may have already been
      // deleted by cancelReminders, so we try to delete it defensively.
      const log = await ctx.db.get(args.reminderLogId);
      if (log) await ctx.db.delete(args.reminderLogId);
      return;
    }

    // Don't send reminders for cancelled appointments
    if (appointment.status === "cancelled") {
      const log = await ctx.db.get(args.reminderLogId);
      if (log) await ctx.db.patch(args.reminderLogId, { status: "canceled" });
      return;
    }

    // Verify the patient still exists
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      const log = await ctx.db.get(args.reminderLogId);
      if (log) await ctx.db.delete(args.reminderLogId);
      return;
    }

    // 1. Fetch Doctor details and setup localization
    const doctor = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.doctorClerkId))
      .unique();
    
    const locale = appointment.locale || "es";
    const t = reminderTranslations[locale] || reminderTranslations.es;
    const doctorName = doctor?.name || doctor?.firstName || t.yourDoctor;

    // 2. Format message text context
    let contextText = t.appointmentTypes.next;
    if (args.reminderType === "2h_before") {
      contextText = t.appointmentTypes.today;
    } else if (args.reminderType === "evening_before") {
      contextText = t.appointmentTypes.tomorrow;
    }

    // 3. Format time
    const appointmentDate = new Date(appointment.start);
    const timezone = appointment.timezone || "America/Mexico_City";
    
    // We can use Intl.DateTimeFormat with the correct locale
    const formattedTime = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(appointmentDate);

    // If we want to include the date as well for 48h_before:
    let timeString = formattedTime;
    if (args.reminderType === "48h_before") {
       const formattedDate = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : locale, {
         weekday: "long",
         day: "numeric",
         month: "long",
         timeZone: timezone,
       }).format(appointmentDate);
       timeString = `${formattedDate} ${t.atConnector} ${formattedTime}`;
    }

    const patientFirstName = patient.fullName.split(" ")[0];
    const isConfirmed = appointment.status === "confirmed";

    // Build the message text
    let messageText: string;
    if (args.reminderType !== "48h_before" && isConfirmed) {
      // Subsequent reminders for confirmed appointments — friendlier tone, no action needed
      messageText = `${t.greeting} ${patientFirstName}, ${t.confirmedReminder}

${t.doctorLabel}: ${doctorName}

${t.timeLabel}: ${timeString}`;
    } else {
      // Standard reminder text (48h or non-confirmed)
      messageText = `${t.greeting} ${patientFirstName}, ${t.reminderPrefix} ${contextText}:

${t.doctorLabel}: ${doctorName}

${t.timeLabel}: ${timeString}

${t.cancelNotice}`;
    }

    // 4. Determine if we should include interactive buttons
    // Only the 48h_before reminder includes confirmation buttons,
    // and only if the appointment hasn't already been confirmed/cancelled
    const shouldIncludeButtons =
      args.reminderType === "48h_before" &&
      appointment.status === "scheduled";

    const reminderActions = shouldIncludeButtons
      ? [
          { actionId: "confirm", label: t.confirmButton, style: "primary" },
          { actionId: "reschedule", label: t.rescheduleButton, style: "ghost" },
        ]
      : undefined;

    const messageType = shouldIncludeButtons
      ? "reminder_confirmation"
      : "text";

    // 5. Get or Create conversation
    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_doctor_and_patient", (q) =>
        q.eq("doctorClerkId", args.doctorClerkId).eq("patientId", args.patientId)
      )
      .unique();

    let conversationId = conversation?._id;

    if (!conversationId) {
      conversationId = await ctx.db.insert("conversations", {
        doctorClerkId: args.doctorClerkId,
        patientId: args.patientId,
        unreadByDoctor: 0,
        unreadByPatient: 0,
      });
      conversation = await ctx.db.get(conversationId);
    }

    // 6. Insert Message with interactive fields
    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: conversationId!,
      senderType: "doctor",
      senderId: args.doctorClerkId,
      text: messageText,
      messageType,
      appointmentId: args.appointmentId,
      reminderActions,
    });

    // 7. Update Conversation
    const previewText = messageText.slice(0, 80).replace(/\n/g, ' ');
    await ctx.db.patch(conversationId!, {
      lastMessageText: previewText,
      lastMessageAt: now,
      unreadByPatient: (conversation?.unreadByPatient ?? 0) + 1,
    });

    // ── Delivery point ──────────────────────────────────────────────────
    // Right now we log to the DB and chat.
    // Future: call Resend / SendGrid / Twilio here with patient.email / patient.phone
    console.log(
      `[Reminder] type=${args.reminderType} | patient=${patient.fullName} (${patient.email}) | appointment="${appointment.title}" at ${new Date(appointment.start).toISOString()} | buttons=${shouldIncludeButtons}`
    );

    // Mark the log entry as fired
    await ctx.db.patch(args.reminderLogId, {
      status: "fired",
      firedAt: Date.now(),
    });
  },
});

// ---------------------------------------------------------------------------
// scheduleReminders — called after an appointment is created
// ---------------------------------------------------------------------------
export const scheduleReminders = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
    doctorClerkId: v.string(),
    planKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Feature gate — only Pro (or higher) doctors get reminders
    if (!hasFeature(args.planKey, "scheduled_reminders")) {
      return;
    }

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || !appointment.patientId) {
      return;
    }

    const reminderTimes = computeReminderTimes(appointment.start);
    const now = Date.now();
    const scheduleIds: Array<import("./_generated/dataModel").Id<"_scheduled_functions">> = [];

    for (const [reminderType, scheduledFor] of Object.entries(reminderTimes)) {
      // Skip reminders whose scheduled time has already passed
      if (scheduledFor <= now) {
        continue;
      }

      // Insert a pending log entry first so we have its ID to pass to the handler
      const reminderLogId = await ctx.db.insert("reminders_log", {
        appointmentId: args.appointmentId,
        patientId: appointment.patientId,
        doctorClerkId: args.doctorClerkId,
        reminderType,
        scheduledFor,
        status: "pending",
      });

      // Schedule the reminder — runAt receives an absolute timestamp (ms)
      const scheduleId = await ctx.scheduler.runAt(
        scheduledFor,
        internal.appointmentReminders.sendReminder,
        {
          appointmentId: args.appointmentId,
          patientId: appointment.patientId,
          doctorClerkId: args.doctorClerkId,
          reminderType,
          scheduledFor,
          reminderLogId,
        }
      );

      scheduleIds.push(scheduleId);
    }

    // Persist the schedule IDs on the appointment so we can cancel them later
    if (scheduleIds.length > 0) {
      await ctx.db.patch(args.appointmentId, {
        reminderScheduleIds: scheduleIds,
      });
    }
  },
});

// ---------------------------------------------------------------------------
// cancelReminders — called before an appointment is deleted
// ---------------------------------------------------------------------------
export const cancelReminders = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
    scheduleIds: v.optional(v.array(v.id("_scheduled_functions"))),
  },
  handler: async (ctx, args) => {
    let scheduleIds = args.scheduleIds;

    // If not provided in args, try to look up the appointment (fallback)
    if (!scheduleIds) {
      const appointment = await ctx.db.get(args.appointmentId);
      scheduleIds = appointment?.reminderScheduleIds ?? [];
    }

    // Cancel each pending scheduled function
    for (const scheduleId of scheduleIds) {
      try {
        await ctx.scheduler.cancel(scheduleId);
      } catch {
        // The scheduled function may have already run or been canceled — ignore
      }
    }

    // Delete ALL reminders_log entries for this appointment (any status)
    const logs = await ctx.db
      .query("reminders_log")
      .withIndex("by_appointment", (q) => q.eq("appointmentId", args.appointmentId))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  },
});
