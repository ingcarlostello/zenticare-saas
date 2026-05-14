export interface Appointment {
  _id: string;
  title: string;
  description?: string;
  start: number;
  end: number;
  status: string;
  doctorName: string;
}

export interface AppointmentCardProps {
  appointment: Appointment;
  dict: Record<string, any>;
  lang: string;
}

export interface StatusBadge {
  label: string;
  className: string;
}

export interface FormattedDate {
  dayName: string;
  day: number;
  monthName: string;
  year: number;
  time: string;
}
