import { generateSlots } from "../../lib/slot-generation";
import { DayConfig } from "./ScheduleManager.types";

export const calculateDailySlotsAvg = (
  weeklyAvailability: DayConfig[],
  appointmentDuration: number
): number => {
  const activeDays = weeklyAvailability.filter((d) => d.isActive);
  const activeDaysCount = activeDays.length;
  
  if (activeDaysCount === 0 || appointmentDuration === 0) return 0;
  
  const totalSlots = weeklyAvailability.reduce((acc, d) => {
    if (!d.isActive) return acc;
    const slots = generateSlots(d.startTime, d.endTime, appointmentDuration, d.breaks);
    return acc + slots.length;
  }, 0);
  
  return Math.round(totalSlots / activeDaysCount);
};

export const calculateTotalBreaks = (weeklyAvailability: DayConfig[]): number => {
  return weeklyAvailability.reduce((acc, d) => acc + (d.isActive ? d.breaks.length : 0), 0);
};
