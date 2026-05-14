import { LOCALE_MAP } from "./AppointmentCard.constants";
import { FormattedDate, StatusBadge } from "./AppointmentCard.types";

export function getStatusBadge(status: string, dict: Record<string, any>): StatusBadge {
  const t = dict.appointments ?? {};
  switch (status) {
    case "confirmed":
      return { label: t.statusConfirmed ?? "Confirmed", className: "badge-success" };
    case "scheduled":
      return { label: t.statusScheduled ?? "Scheduled", className: "badge-info" };
    case "cancelled":
      return { label: t.statusCancelled ?? "Cancelled", className: "badge-error" };
    case "reschedule_requested":
      return { label: t.statusRescheduleRequested ?? "Reschedule Requested", className: "badge-warning" };
    default:
      return { label: status, className: "badge-ghost" };
  }
}

export function formatAppointmentDate(timestamp: number, lang: string): FormattedDate {
  const date = new Date(timestamp);
  const locale = LOCALE_MAP[lang] || "en-US";

  const dayName = date.toLocaleDateString(locale, { weekday: "short" });
  const day = date.getDate();
  const monthName = date.toLocaleDateString(locale, { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { dayName, day, monthName, year, time };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
