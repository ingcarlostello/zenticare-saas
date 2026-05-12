import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { generateSlots, Break } from "../../lib/slot-generation";
import { DayConfig, ToastState } from "./ScheduleManager.types";
import { 
  DEFAULT_DAYS, 
  DEFAULT_START_TIME, 
  DEFAULT_END_TIME, 
  INITIAL_APPOINTMENT_DURATION 
} from "./ScheduleManager.constants";
import { calculateDailySlotsAvg, calculateTotalBreaks } from "./ScheduleManager.utils";

export function useScheduleManager(dict: any) {
  const existingSchedule = useQuery(api.schedules.get);
  const updateSchedule = useMutation(api.schedules.update);

  const [appointmentDuration, setAppointmentDuration] = useState<number>(INITIAL_APPOINTMENT_DURATION);
  const [weeklyAvailability, setWeeklyAvailability] = useState<DayConfig[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Initialize state from existing schedule or default to Mon-Fri 9-5
  useEffect(() => {
    if (existingSchedule !== undefined) {
      if (existingSchedule) {
        setAppointmentDuration(existingSchedule.appointmentDuration);
        setWeeklyAvailability(existingSchedule.weeklyAvailability);
      } else {
        // Prepopulate with default
        setAppointmentDuration(INITIAL_APPOINTMENT_DURATION);
        setWeeklyAvailability(
          DEFAULT_DAYS.map((day) => ({
            day,
            isActive: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day),
            startTime: DEFAULT_START_TIME,
            endTime: DEFAULT_END_TIME,
            breaks: [],
          }))
        );
      }
    }
  }, [existingSchedule]);

  // Derived Summary Stats
  const activeDaysCount = weeklyAvailability.filter((d) => d.isActive).length;
  const totalBreaks = useMemo(() => calculateTotalBreaks(weeklyAvailability), [weeklyAvailability]);
  
  const dailySlotsAvg = useMemo(() => 
    calculateDailySlotsAvg(weeklyAvailability, appointmentDuration), 
  [weeklyAvailability, appointmentDuration]);

  // Preview logic
  const selectedConfig = weeklyAvailability.find((d) => d.day === selectedDay);
  const previewSlots = useMemo(() => {
    if (!selectedConfig || !selectedConfig.isActive) return [];
    return generateSlots(
      selectedConfig.startTime,
      selectedConfig.endTime,
      appointmentDuration,
      selectedConfig.breaks
    );
  }, [selectedConfig, appointmentDuration]);

  // Helpers
  const handleToggleDay = (day: string) => {
    setWeeklyAvailability((prev) =>
      prev.map((d) => (d.day === day ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleTimeChange = (day: string, field: "startTime" | "endTime", value: string) => {
    setWeeklyAvailability((prev) =>
      prev.map((d) => (d.day === day ? { ...d, [field]: value } : d))
    );
  };

  const handleAddBreak = (day: string) => {
    setWeeklyAvailability((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          return {
            ...d,
            breaks: [...d.breaks, { name: "", startTime: "12:00", endTime: "13:00" }],
          };
        }
        return d;
      })
    );
  };

  const handleUpdateBreak = (day: string, index: number, field: keyof Break, value: string) => {
    setWeeklyAvailability((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          const newBreaks = [...d.breaks];
          newBreaks[index] = { ...newBreaks[index], [field]: value } as Break;
          return { ...d, breaks: newBreaks };
        }
        return d;
      })
    );
  };

  const handleRemoveBreak = (day: string, index: number) => {
    setWeeklyAvailability((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          const newBreaks = [...d.breaks];
          newBreaks.splice(index, 1);
          return { ...d, breaks: newBreaks };
        }
        return d;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSchedule({
        appointmentDuration,
        weeklyAvailability,
      });
      setToast({ type: "success", message: dict.schedule.saveSuccess });
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: dict.schedule.saveError });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return {
    isLoading: existingSchedule === undefined || weeklyAvailability.length === 0,
    appointmentDuration,
    setAppointmentDuration,
    weeklyAvailability,
    selectedDay,
    setSelectedDay,
    isSaving,
    toast,
    activeDaysCount,
    totalBreaks,
    dailySlotsAvg,
    previewSlots,
    selectedConfig,
    handleToggleDay,
    handleTimeChange,
    handleAddBreak,
    handleUpdateBreak,
    handleRemoveBreak,
    handleSave,
  };
}
