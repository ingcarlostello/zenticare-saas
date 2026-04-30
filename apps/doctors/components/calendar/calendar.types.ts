import { Id } from "@repo/database/convex/_generated/dataModel";
import { Locale } from "../../app/i18n/config";

export interface CalendarEvent {
  _id?: Id<"appointments">;
  title: string;
  start: Date;
  end: Date;
  patientId?: Id<"patients">;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface AppointmentModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { start: Date; end: Date } | null;
  selectedEvent: CalendarEvent | null;
}

export interface CalendarViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  lang: Locale;
}
