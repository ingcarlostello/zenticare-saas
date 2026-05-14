import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Helper: resolve patient from Clerk identity ───────────────────────────
async function getAuthenticatedPatient(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const patient = await ctx.db
    .query("patients")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  return patient;
}

// ── Queries ────────────────────────────────────────────────────────────────

/** Get the authenticated patient's profile. */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const patient = await getAuthenticatedPatient(ctx);
    if (!patient) return null;

    // Fetch doctor info (may be null if patient self-registered without a doctor)
    let doctorName = "";
    let doctorEmail = "";
    if (patient.doctorClerkId) {
      const doctor = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", patient.doctorClerkId))
        .unique();
      doctorName = doctor?.name ?? doctor?.firstName ?? "";
      doctorEmail = doctor?.email ?? "";
    }

    return {
      ...patient,
      doctorName,
      doctorEmail,
    };
  },
});

/** List all appointments for the authenticated patient, enriched with doctor name. */
export const listMyAppointments = query({
  args: {},
  handler: async (ctx) => {
    const patient = await getAuthenticatedPatient(ctx);
    if (!patient) return [];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patientId", (q: any) => q.eq("patientId", patient._id))
      .collect();

    // Enrich each appointment with doctor info
    const doctorCache: Record<string, { name: string; imageUrl?: string }> = {};

    const enriched = await Promise.all(
      appointments.map(async (apt: any) => {
        if (!doctorCache[apt.doctorClerkId]) {
          const doctor = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q: any) => q.eq("clerkId", apt.doctorClerkId))
            .unique();
          doctorCache[apt.doctorClerkId] = {
            name: doctor?.name ?? doctor?.firstName ?? "Doctor",
          };
        }
        return {
          ...apt,
          doctorName: doctorCache[apt.doctorClerkId]!.name,
        };
      })
    );

    return enriched;
  },
});

/** Get the next N upcoming appointments for the home page. */
export const getUpcomingAppointments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const patient = await getAuthenticatedPatient(ctx);
    if (!patient) return [];

    const now = Date.now();
    const limit = args.limit ?? 3;

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patientId", (q: any) => q.eq("patientId", patient._id))
      .collect();

    // Filter upcoming (future + not cancelled), sort by start asc, take limit
    const upcoming = appointments
      .filter((apt: any) => apt.start >= now && apt.status !== "cancelled")
      .sort((a: any, b: any) => a.start - b.start)
      .slice(0, limit);

    // Enrich with doctor info
    const doctorCache: Record<string, { name: string }> = {};

    const enriched = await Promise.all(
      upcoming.map(async (apt: any) => {
        if (!doctorCache[apt.doctorClerkId]) {
          const doctor = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q: any) => q.eq("clerkId", apt.doctorClerkId))
            .unique();
          doctorCache[apt.doctorClerkId] = {
            name: doctor?.name ?? doctor?.firstName ?? "Doctor",
          };
        }
        return {
          ...apt,
          doctorName: doctorCache[apt.doctorClerkId]!.name,
        };
      })
    );

    return enriched;
  },
});

/** Get unread message count for the patient (for sidebar badge). */
export const getMyUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const patient = await getAuthenticatedPatient(ctx);
    if (!patient) return 0;

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_patient", (q: any) => q.eq("patientId", patient._id))
      .take(50);

    let total = 0;
    for (const conv of conversations) {
      total += conv.unreadByPatient ?? 0;
    }
    return total;
  },
});

/** Get the patient ID for the authenticated user (used to pass to chat). */
export const getMyPatientId = query({
  args: {},
  handler: async (ctx) => {
    const patient = await getAuthenticatedPatient(ctx);
    if (!patient) return null;
    return patient._id;
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

/** Update the authenticated patient's profile fields. */
export const updateMyProfile = mutation({
  args: {
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelationship: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!patient) throw new Error("Patient profile not found");

    await ctx.db.patch(patient._id, args);
    return { success: true };
  },
});
