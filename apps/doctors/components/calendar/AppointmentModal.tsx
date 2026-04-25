"use client";

import { Id } from "@repo/database/convex/_generated/dataModel";
import { useAppointmentModal } from "./useAppointmentModal";
import { AppointmentModalProps } from "./calendar.types";

export function AppointmentModal({
  dict,
  isOpen,
  onClose,
  selectedSlot,
  selectedEvent,
}: AppointmentModalProps) {
  const {
    title,
    setTitle,
    patientId,
    setPatientId,
    patients,
    handleSubmit,
    handleDelete,
    modalRef,
    displayStart,
    displayEnd,
  } = useAppointmentModal({
    isOpen,
    onClose,
    selectedSlot,
    selectedEvent,
  });

  return (
    <dialog ref={modalRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {selectedEvent ? dict.calendar.editEvent : dict.calendar.addEvent}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{dict.calendar.eventName}</span>
            </label>
            <input
              type="text"
              placeholder={dict.calendar.eventName}
              className="input input-bordered w-full focus:outline-offset-0 focus:border-primary focus:ring-1 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{dict.calendar.selectPatient}</span>
            </label>
            <select
              className="select select-bordered w-full focus:outline-offset-0 focus:border-primary focus:ring-1 focus:ring-primary"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value as Id<"patients">)}
              required
            >
              <option value="" disabled>
                {dict.calendar.selectPatient}
              </option>
              {patients?.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </div>

          {(displayStart && displayEnd) && (
            <div className="text-sm opacity-70 bg-base-200 p-3 rounded-lg border border-base-300">
              <p>
                <strong>{dict.calendar.start}:</strong> {displayStart.toLocaleString()}
              </p>
              <p>
                <strong>{dict.calendar.end}:</strong> {displayEnd.toLocaleString()}
              </p>
            </div>
          )}

          <div className="modal-action flex justify-between items-center">
            <div>
              {selectedEvent && (
                <button
                  type="button"
                  className="btn btn-error btn-outline"
                  onClick={handleDelete}
                >
                  {dict.calendar.delete}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {dict.calendar.cancel}
              </button>
              <button type="submit" className="btn btn-primary" disabled={!title || !patientId}>
                {dict.calendar.save}
              </button>
            </div>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
