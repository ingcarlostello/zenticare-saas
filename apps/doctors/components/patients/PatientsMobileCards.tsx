"use client";

import { MoreHorizontal, Pencil, Trash2, CalendarDays } from "lucide-react";
import { getInitials, getAvatarColor, formatDate } from "./patients.helpers";
import type { PatientsMobileCardsProps } from "./patients.types";

export function PatientsMobileCards({
  dict,
  patients,
  onEdit,
  onDelete,
}: PatientsMobileCardsProps) {
  return (
    <div className="md:hidden flex flex-col gap-3">
      {patients.map((patient) => (
        <div
          key={patient._id}
          className="card card-border bg-base-100 shadow-sm"
        >
          <div className="card-body p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(patient.fullName)}`}
                  >
                    {getInitials(patient.fullName)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{patient.fullName}</h3>
                  {patient.age !== undefined && (
                    <span className="text-xs opacity-50">
                      {dict.patients.age}: {patient.age}
                    </span>
                  )}
                </div>
              </div>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-10 w-40 p-2 shadow-lg border border-base-200"
                >
                  <li>
                    <button onClick={() => onEdit(patient)}>
                      <Pencil className="w-4 h-4" />
                      {dict.patients.edit}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onDelete(patient)}
                      className="text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                      {dict.patients.delete}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="divider my-1"></div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="opacity-50 text-xs">{dict.patients.email}</span>
                <p className="truncate">{patient.email}</p>
              </div>
              <div>
                <span className="opacity-50 text-xs">{dict.patients.phone}</span>
                <p>{patient.phone}</p>
              </div>
              <div className="col-span-2">
                <span className="opacity-50 text-xs">{dict.patients.lastAppointment}</span>
                <p className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 opacity-40" />
                  {formatDate(patient.lastAppointmentDate)}
                </p>
              </div>
              {patient.appointmentDescription && (
                <div className="col-span-2">
                  <span className="opacity-50 text-xs">
                    {dict.patients.appointmentDescription}
                  </span>
                  <p className="opacity-70">{patient.appointmentDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
