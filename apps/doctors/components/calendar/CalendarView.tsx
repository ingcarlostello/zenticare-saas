"use client";

import { Calendar, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppointmentModal } from "./AppointmentModal";
import { CalendarViewProps } from "./calendar.types";
import { useCalendar } from "./useCalendar";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { useSyncCalendar } from "../../hooks/useSyncCalendar";
import { CalendarDisconnected } from "./CalendarDisconnected";
import { CalendarToolbar } from "./CalendarToolbar";
import { URL_GOOGLE_CALENDAR } from "./calendar.constants";

export function CalendarView({ dict, lang }: CalendarViewProps) {
  const {
    isConnected,
    isLoading,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
  } = useGoogleAuth(dict);

  const { sync, isSyncing } = useSyncCalendar(dict);

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

  const handleOpenGoogleCalendar = () => {
    window.open(URL_GOOGLE_CALENDAR, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-base-100 rounded-box border border-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <CalendarDisconnected 
        dict={dict} 
        onConnect={connect} 
        isConnecting={isConnecting} 
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-base-100 rounded-box p-4 md:p-6 shadow-sm border border-base-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{dict.calendar.title || "Schedule"}</h2>
          <p className="text-sm opacity-70 mt-1">
            {dict.page?.description || "Manage your schedule"}
          </p>
        </div>
        
        {/* Usar el nuevo Toolbar en lugar de los botones fijos */}
        <CalendarToolbar 
          dict={dict}
          onSync={sync}
          isSyncing={isSyncing}
          onDisconnect={disconnect}
          isDisconnecting={isDisconnecting}
          onOpenGoogleCalendar={handleOpenGoogleCalendar}
        />
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

      {/* AppointmentModal sigue aqui pero ya no tiene la función de crear porque no enviaremos a Google por ahora */}
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
