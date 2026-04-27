export function normalizeGoogleEvent(googleEvent: any, doctorClerkId: string) {
  if (googleEvent.status === "cancelled") {
    return {
      doctorClerkId,
      googleEventId: googleEvent.id,
      title: "",
      description: "",
      start: 0,
      end: 0,
      status: "cancelled",
      isAllDay: false,
      patientId: undefined,
    };
  }

  // Determine if all-day event
  const isAllDay = !!googleEvent.start?.date;

  // Calculate start time in ms
  let startMs = 0;
  if (isAllDay) {
    // For all-day events, date is YYYY-MM-DD
    startMs = new Date(googleEvent.start.date + "T00:00:00Z").getTime();
  } else {
    startMs = new Date(googleEvent.start.dateTime).getTime();
  }

  // Calculate end time in ms
  let endMs = 0;
  if (googleEvent.end?.dateTime) {
    endMs = new Date(googleEvent.end.dateTime).getTime();
  } else if (googleEvent.end?.date) {
    endMs = new Date(googleEvent.end.date + "T00:00:00Z").getTime();
  } else {
    // Fallback if no end time (unlikely in GCal but possible in corrupt data)
    endMs = startMs + 3600000; // +1 hour
  }

  return {
    doctorClerkId,
    googleEventId: googleEvent.id,
    title: googleEvent.summary || "(No title)",
    description: googleEvent.description || "",
    start: startMs,
    end: endMs,
    status: googleEvent.status === "cancelled" ? "cancelled" : "confirmed",
    isAllDay,
    // Google events don't have patientId by default
    patientId: undefined, 
  };
}
