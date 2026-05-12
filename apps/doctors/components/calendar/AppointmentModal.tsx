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
    canUseReminders,
    canCancel,
    appointmentStatus,
    showCancelConfirm,
    setShowCancelConfirm,
    cancelReason,
    setCancelReason,
    isCancelling,
    handleCancelConfirm,
    statusInfo,
  } = useAppointmentModal({
    dict,
    isOpen,
    onClose,
    selectedSlot,
    selectedEvent,
  });


  return (
    <dialog ref={modalRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold text-lg">
            {selectedEvent ? dict.calendar.editEvent : dict.calendar.addEvent}
          </h3>
          {statusInfo && (
            <span className={`${statusInfo.className} badge-sm`}>{statusInfo.label}</span>
          )}
        </div>
        
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
              disabled={appointmentStatus === "cancelled"}
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
              disabled={appointmentStatus === "cancelled"}
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

          {/* Reminder badge — only shown when creating a new appointment */}
          {!selectedEvent && (
            canUseReminders ? (
              <div className="flex items-center gap-2 text-sm bg-success/10 border border-success/30 text-success rounded-lg px-3 py-2">
                <span>✓</span>
                <span>{dict.calendar.remindersWillBeSent}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm bg-base-200 border border-base-300 text-base-content/50 rounded-lg px-3 py-2">
                <span>🔒</span>
                <span>{dict.calendar.remindersProOnly}</span>
              </div>
            )
          )}

          {/* Cancel appointment confirmation area */}
          {showCancelConfirm && (
            <div className="bg-error/5 border border-error/30 rounded-lg p-4">
              <p className="text-sm text-error font-medium mb-2">
                {dict.calendar.cancelAppointmentConfirm ?? "Are you sure you want to cancel? The patient will be notified."}
              </p>
              <input
                type="text"
                placeholder={dict.calendar.cancelReason ?? "Reason (optional)"}
                className="input input-bordered input-sm w-full mb-3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-error btn-sm flex-1"
                  onClick={handleCancelConfirm}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    dict.calendar.cancelAppointment ?? "Cancel Appointment"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason("");
                  }}
                >
                  {dict.calendar.cancel}
                </button>
              </div>
            </div>
          )}

          <div className="modal-action flex justify-between items-center">
            <div className="flex gap-2">
              {selectedEvent && (
                <button
                  type="button"
                  className="btn btn-error btn-outline"
                  onClick={handleDelete}
                >
                  {dict.calendar.delete}
                </button>
              )}
              {/* Cancel appointment button — only for existing appointments with patients, not cancelled */}
              {selectedEvent && canCancel && !showCancelConfirm && (
                <button
                  type="button"
                  className="btn btn-warning btn-outline btn-sm"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  {dict.calendar.cancelAppointment ?? "Cancel Appointment"}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {dict.calendar.cancel}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!title || !patientId || appointmentStatus === "cancelled"}
              >
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
