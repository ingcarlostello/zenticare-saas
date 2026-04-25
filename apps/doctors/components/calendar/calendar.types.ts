import { Id } from "@repo/database/convex/_generated/dataModel";
import { Locale } from "../../app/i18n/config";

export interface CalendarEvent {
  _id?: Id<"appointments">;
  title: string;
  start: Date;
  end: Date;
  patientId?: Id<"patients">;
  [key: string]: any;
}

export interface AppointmentModalProps {
  dict: any;
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { start: Date; end: Date } | null;
  selectedEvent: CalendarEvent | null;
}

export interface CalendarViewProps {
  dict: any;
  lang: Locale;
}
