"use client";

import { useAppointmentCard } from "./useAppointmentCard";
import { AppointmentCardProps } from "./AppointmentCard.types";

export function AppointmentCard(props: AppointmentCardProps) {
  const { appointment } = props;
  const { dayName, day, monthName, year, time, status, initials } = useAppointmentCard(props);

  return (
    <div className="card card-border bg-base-100 hover:shadow-sm transition-shadow">
      <div className="card-body px-5 py-4">
        <div className="flex items-start gap-4">
          {/* Doctor avatar */}
          <div className="shrink-0">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="text-sm font-bold leading-none">{initials}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{appointment.doctorName}</h3>
              </div>
              <span className={`badge badge-sm ${status.className} shrink-0`}>
                {status.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-base-content/60">
              <span className="flex items-center gap-1">
                📅 {dayName}, {day} {monthName} {year}
              </span>
              <span className="flex items-center gap-1">
                🕐 {time} hrs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
