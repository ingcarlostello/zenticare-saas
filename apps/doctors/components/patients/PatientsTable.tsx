"use client";

import { MoreHorizontal, Pencil, Trash2, CalendarDays } from "lucide-react";
import { getInitials, getAvatarColor, formatDate } from "./patients.helpers";
import type { PatientsTableProps } from "./patients.types";

export function PatientsTable({
  dict,
  patients,
  onEdit,
  onDelete,
}: PatientsTableProps) {
  return (
    <div className="hidden md:block">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="text-base-content/60">
            <th className="font-semibold">{dict.patients.fullName}</th>
            <th className="font-semibold">{dict.patients.age}</th>
            <th className="font-semibold">{dict.patients.contactInfo}</th>
            <th className="font-semibold">{dict.patients.lastAppointment}</th>
            <th className="font-semibold">{dict.patients.appointmentDescription}</th>
            <th className="font-semibold text-right">{dict.patients.actions}</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id} className="hover:bg-base-200/50 transition-colors">
              {/* Name + Avatar */}
              <td>
                <div className="flex items-center gap-3">
                  <div className={`avatar placeholder`}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(patient.fullName)}`}
                    >
                      {getInitials(patient.fullName)}
                    </div>
                  </div>
                  <span className="font-medium">{patient.fullName}</span>
                </div>
              </td>
              {/* Age */}
              <td>
                <span className="opacity-70">{patient.age ?? "—"}</span>
              </td>
              {/* Contact */}
              <td>
                <div className="flex flex-col">
                  <span className="text-sm truncate max-w-[200px]">{patient.email}</span>
                  <span className="text-xs opacity-50">{patient.phone}</span>
                </div>
              </td>
              {/* Last Appointment */}
              <td>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 opacity-40" />
                  <span className="text-sm">{formatDate(patient.lastAppointmentDate)}</span>
                </div>
              </td>
              {/* Description */}
              <td>
                <span className="text-sm opacity-70 truncate block max-w-[180px]">
                  {patient.appointmentDescription || "—"}
                </span>
              </td>
              {/* Actions */}
              <td className="text-right">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
