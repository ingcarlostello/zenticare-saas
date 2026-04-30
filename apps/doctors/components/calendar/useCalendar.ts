import { useState, useMemo, useCallback } from "react";
import { Views, View, SlotInfo, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { CalendarEvent, CalendarViewProps } from "./calendar.types";
import { CALENDAR_LOCALES } from "./calendar.constants";

export function useCalendar({ dict, lang }: CalendarViewProps) {
  // Controlled state for the calendar
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const localizer = useMemo(() => {
    return dateFnsLocalizer({
      format,
      parse,
      startOfWeek: () => startOfWeek(new Date(), { locale: CALENDAR_LOCALES[lang] }),
      getDay,
      locales: CALENDAR_LOCALES,
    });
  }, [lang]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Fetch appointments
  const appointmentsQuery = useQuery(api.appointments.listByDoctor, {});

  // Map Convex appointments to react-big-calendar format
  const events = useMemo(() => {
    if (!appointmentsQuery) return [];
    return appointmentsQuery.map((app) => ({
      ...app,
      start: new Date(app.start),
      end: new Date(app.end),
    }));
  }, [appointmentsQuery]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedEvent(null);
    setSelectedSlot({
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedSlot(null);
    setSelectedEvent(event);
    setModalOpen(true);
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const messages = useMemo(() => ({
    allDay: dict.calendar.allDay || "All Day",
    previous: dict.calendar.previous,
    next: dict.calendar.next,
    today: dict.calendar.today,
    month: dict.calendar.month,
    week: dict.calendar.week,
    day: dict.calendar.day,
    agenda: dict.calendar.agenda,
    date: dict.calendar.date || "Date",
    time: dict.calendar.time || "Time",
    event: dict.calendar.event || "Event",
    noEventsInRange: dict.calendar.noEventsInRange || "No events in this range",
    showMore: (total: number) => `+${total} ${dict.calendar.showMore || "more"}`
  }), [dict]);

  return {
    view,
    date,
    localizer,
    events,
    modalOpen,
    selectedSlot,
    selectedEvent,
    messages,
    handleSelectSlot,
    handleSelectEvent,
    handleNavigate,
    handleViewChange,
    closeModal,
  };
}
