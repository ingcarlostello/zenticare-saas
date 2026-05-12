"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { generateSlots, Break } from "../../lib/slot-generation";
import { CalendarDays, Clock, Save, Plus, Trash2, CheckCircle2, CalendarClock } from "lucide-react";

interface ScheduleManagerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

const DEFAULT_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:00";

interface DayConfig {
  day: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  breaks: Break[];
}

export function ScheduleManager({ dict }: ScheduleManagerProps) {
  const existingSchedule = useQuery(api.schedules.get);
  const updateSchedule = useMutation(api.schedules.update);

  const [appointmentDuration, setAppointmentDuration] = useState<number>(30);
  const [weeklyAvailability, setWeeklyAvailability] = useState<DayConfig[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initialize state from existing schedule or default to Mon-Fri 9-5
  useEffect(() => {
    if (existingSchedule !== undefined) {
      if (existingSchedule) {
        setAppointmentDuration(existingSchedule.appointmentDuration);
        setWeeklyAvailability(existingSchedule.weeklyAvailability);
      } else {
        // Prepopulate with default
        setAppointmentDuration(30);
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
  const totalBreaks = weeklyAvailability.reduce((acc, d) => acc + (d.isActive ? d.breaks.length : 0), 0);
  const dailySlotsAvg = useMemo(() => {
    if (activeDaysCount === 0 || appointmentDuration === 0) return 0;
    const totalSlots = weeklyAvailability.reduce((acc, d) => {
      if (!d.isActive) return acc;
      const slots = generateSlots(d.startTime, d.endTime, appointmentDuration, d.breaks);
      return acc + slots.length;
    }, 0);
    return Math.round(totalSlots / activeDaysCount);
  }, [weeklyAvailability, appointmentDuration, activeDaysCount]);

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

  if (existingSchedule === undefined || weeklyAvailability.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-start gap-4 border-b border-base-200 bg-base-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dict.schedule.title}</h1>
          <p className="text-sm text-base-content/70">
            {dict.schedule.description}
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {dict.schedule.save}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-base-200/50 p-6">
        <div className="space-y-6">
          {/* Top Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-medium text-base-content/60">{dict.schedule.workingDays}</h3>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <CalendarDays className="h-5 w-5 text-primary" />
              {activeDaysCount} <span className="text-sm font-normal text-base-content/50">/ 7</span>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-medium text-base-content/60">{dict.schedule.slotDuration}</h3>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Clock className="h-5 w-5 text-secondary" />
              {appointmentDuration} <span className="text-sm font-normal text-base-content/50">min</span>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-medium text-base-content/60">{dict.schedule.dailySlotsAvg}</h3>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              {dailySlotsAvg}
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-medium text-base-content/60">{dict.schedule.totalBreaks}</h3>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-neutral">{totalBreaks}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Configuration */}
        <div className="flex-1 w-full space-y-6">
          {/* Duration Config */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6">
              <h2 className="card-title text-lg">{dict.schedule.appointmentDuration}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {[15, 20, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    className={`btn btn-sm ${
                      appointmentDuration === min ? "btn-primary" : "btn-outline border-base-300"
                    }`}
                    onClick={() => setAppointmentDuration(min)}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Availability */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6 space-y-4">
              <h2 className="card-title text-lg">{dict.schedule.weeklyAvailability}</h2>
              <div className="space-y-4 divide-y divide-base-200">
                {weeklyAvailability.map((config) => (
                  <div key={config.day} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between sm:justify-start gap-4 mb-3">
                      <div className="flex items-center gap-3 w-40">
                        <input
                          type="checkbox"
                          className="toggle toggle-primary toggle-sm"
                          checked={config.isActive}
                          onChange={() => handleToggleDay(config.day)}
                        />
                        <span className="font-medium capitalize">{dict.schedule.days[config.day] || config.day}</span>
                      </div>
                      
                      {config.isActive ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="time"
                            className="input input-bordered input-sm w-32"
                            value={config.startTime}
                            onChange={(e) => handleTimeChange(config.day, "startTime", e.target.value)}
                          />
                          <span className="text-base-content/50">-</span>
                          <input
                            type="time"
                            className="input input-bordered input-sm w-32"
                            value={config.endTime}
                            onChange={(e) => handleTimeChange(config.day, "endTime", e.target.value)}
                          />
                          {config.breaks.length > 0 && (
                            <span className="badge badge-neutral bg-base-200 text-base-content border-0 ml-2">
                              {config.breaks.length === 1 
                                ? dict.schedule.breakCount_one 
                                : dict.schedule.breakCount_other?.replace("{count}", config.breaks.length.toString())}
                            </span>
                          )}
                          <button
                            className="btn btn-ghost btn-sm text-primary ml-auto"
                            onClick={() => handleAddBreak(config.day)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {dict.schedule.addBreak}
                          </button>
                        </div>
                      ) : (
                        <span className="text-base-content/40 text-sm italic">{dict.schedule.dayOff}</span>
                      )}
                    </div>

                    {/* Breaks */}
                    {config.isActive && config.breaks.length > 0 && (
                      <div className="ml-12 pl-4 border-l-2 border-base-200 space-y-2 mt-2">
                        {config.breaks.map((b, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2 bg-base-200/50 p-2 rounded-lg">
                            <input
                              type="text"
                              placeholder={dict.schedule.breakName}
                              className="input input-bordered input-sm flex-1 min-w-[120px]"
                              value={b.name}
                              onChange={(e) => handleUpdateBreak(config.day, i, "name", e.target.value)}
                            />
                            <input
                              type="time"
                              className="input input-bordered input-sm w-28"
                              value={b.startTime}
                              onChange={(e) => handleUpdateBreak(config.day, i, "startTime", e.target.value)}
                            />
                            <span className="text-base-content/50">-</span>
                            <input
                              type="time"
                              className="input input-bordered input-sm w-28"
                              value={b.endTime}
                              onChange={(e) => handleUpdateBreak(config.day, i, "endTime", e.target.value)}
                            />
                            <button
                              className="btn btn-ghost btn-square btn-sm text-error"
                              onClick={() => handleRemoveBreak(config.day, i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Preview */}
        <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-6">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between w-full mb-2">
                <h2 className="card-title text-lg flex items-center gap-2 m-0">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  {dict.schedule.patientView}
                </h2>
                <span className="badge badge-neutral bg-base-200 text-base-content font-normal text-xs border-0 py-3">
                  {dict.schedule.slotsAvailable?.replace("{count}", previewSlots.length.toString())}
                </span>
              </div>
              <p className="text-sm text-base-content/60 mb-4">{dict.schedule.patientViewDesc}</p>

              {/* Day Selector for preview */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {DEFAULT_DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`btn btn-sm rounded-full px-4 ${
                      selectedDay === day ? "btn-secondary" : "btn-ghost bg-base-200"
                    }`}
                  >
                    {dict.schedule.days[day]?.slice(0, 3) || day.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div className="divider my-2"></div>

              {/* Preview Grid */}
              <div className="min-h-[300px]">
                {!selectedConfig?.isActive ? (
                  <div className="flex h-40 flex-col items-center justify-center text-base-content/40">
                    <p className="italic">{dict.schedule.dayOff}</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-center text-sm font-medium text-base-content/80">
                      {selectedConfig.startTime} - {selectedConfig.endTime}
                      {selectedConfig.breaks.length > 0 && (
                        <span className="text-base-content/50">
                          {" | "}
                          {selectedConfig.breaks.map((b) => b.name || "Break").join(", ")}
                        </span>
                      )}
                    </div>
                    {previewSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {previewSlots.map((slot) => (
                          <button
                            key={slot}
                            className="btn btn-outline btn-sm border-base-300 hover:btn-primary hover:text-primary-content"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center text-center text-sm text-base-content/50">
                        No slots available with current settings.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast toast-bottom toast-end z-50">
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"} text-white shadow-lg`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
