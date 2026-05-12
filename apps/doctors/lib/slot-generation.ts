export interface Break {
  name: string;
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
}

export function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  breaks: Break[]
): string[] {
  if (!startTime || !endTime || !durationMinutes) return [];

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const toTimeStr = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  const slots: string[] = [];

  for (
    let current = startMin;
    current + durationMinutes <= endMin;
    current += durationMinutes
  ) {
    const slotEnd = current + durationMinutes;

    const overlaps = breaks.some((b) => {
      if (!b.startTime || !b.endTime) return false;
      const bStart = toMinutes(b.startTime);
      const bEnd = toMinutes(b.endTime);
      return current < bEnd && slotEnd > bStart;
    });

    if (!overlaps) {
      slots.push(toTimeStr(current));
    }
  }

  return slots;
}
