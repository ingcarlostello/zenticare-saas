"use client";

import { Calendar, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppointmentModal } from "./AppointmentModal";
import { CalendarViewProps } from "./calendar.types";
import { useCalendar } from "./useCalendar";

export function CalendarView({ dict, lang }: CalendarViewProps) {
  const {
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
  } = useCalendar({ dict, lang });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-base-100 rounded-box p-4 md:p-6 shadow-sm border border-base-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{dict.calendar.title}</h2>
          <p className="text-sm opacity-70 mt-1">
            {dict.page?.description || "Manage your schedule"}
          </p>
        </div>
        <div className="flex gap-2">
          {dict.calendar.openGoogleCalendar && (
            <button className="btn btn-outline btn-sm hidden sm:flex">
              {dict.calendar.openGoogleCalendar}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          
          // Controlled props
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          culture={lang}
          messages={messages}
          popup
        />
      </div>

      <AppointmentModal 
        dict={dict} 
        isOpen={modalOpen} 
        onClose={closeModal} 
        selectedSlot={selectedSlot}
        selectedEvent={selectedEvent}
      />
    </div>
  );
}
