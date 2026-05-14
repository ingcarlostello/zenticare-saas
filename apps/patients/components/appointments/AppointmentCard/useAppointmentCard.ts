import { formatAppointmentDate, getStatusBadge, getInitials } from "./AppointmentCard.helpers";
import { AppointmentCardProps } from "./AppointmentCard.types";

export function useAppointmentCard({ appointment, dict, lang }: AppointmentCardProps) {
  const { dayName, day, monthName, year, time } = formatAppointmentDate(appointment.start, lang);
  const status = getStatusBadge(appointment.status, dict);
  const initials = getInitials(appointment.doctorName);

  return {
    dayName,
    day,
    monthName,
    year,
    time,
    status,
    initials,
  };
}
