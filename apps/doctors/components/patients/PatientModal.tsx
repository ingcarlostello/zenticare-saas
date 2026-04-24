"use client";

import { usePatientForm } from "./usePatientForm";
import type { PatientModalProps } from "./patients.types";


export function PatientModal({ dict, patient, onClose }: PatientModalProps) {
  const {
    form: {
      fullName,
      setFullName,
      age,
      setAge,
      email,
      setEmail,
      phone,
      setPhone,
      address,
      setAddress,
      lastAppointmentDate,
      setLastAppointmentDate,
      appointmentDescription,
      setAppointmentDescription,
    },
    errors,
    setErrors,
    isSaving,
    dialogRef,
    handleSave,
    isEditing,
  } = usePatientForm({ patient, onClose });

  const title = isEditing ? dict.patients.editPatient : dict.patients.addPatient;

  return (
    <dialog ref={dialogRef} className="modal modal-open" onClose={onClose}>
      <div className="modal-box w-11/12 max-w-2xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-xl font-bold mb-6">{title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name — required */}
          <div className="form-control sm:col-span-2">
            <label className="label">
              <span className="label-text font-medium">
                {dict.patients.fullName}
                <span className="text-error ml-1">*</span>
              </span>
            </label>
            <input
              type="text"
              className={`input input-bordered w-full ${errors.fullName ? "input-error" : ""}`}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: false }));
              }}
              placeholder={dict.patients.fullName}
            />
            {errors.fullName && (
              <label className="label">
                <span className="label-text-alt text-error">{dict.patients.requiredField}</span>
              </label>
            )}
          </div>

          {/* Age — optional */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{dict.patients.age}</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={dict.patients.age}
              min="0"
              max="150"
            />
          </div>

          {/* Email — required */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {dict.patients.email}
                <span className="text-error ml-1">*</span>
              </span>
            </label>
            <input
              type="email"
              className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: false }));
              }}
              placeholder={dict.patients.email}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{dict.patients.requiredField}</span>
              </label>
            )}
          </div>

          {/* Phone — required */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {dict.patients.phone}
                <span className="text-error ml-1">*</span>
              </span>
            </label>
            <input
              type="tel"
              className={`input input-bordered w-full ${errors.phone ? "input-error" : ""}`}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
              }}
              placeholder={dict.patients.phone}
            />
            {errors.phone && (
              <label className="label">
                <span className="label-text-alt text-error">{dict.patients.requiredField}</span>
              </label>
            )}
          </div>

          {/* Address — optional */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{dict.patients.address}</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={dict.patients.address}
            />
          </div>

          {/* Last Appointment Date — optional */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{dict.patients.lastAppointment}</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={lastAppointmentDate}
              onChange={(e) => setLastAppointmentDate(e.target.value)}
            />
          </div>

          {/* Appointment Description — optional */}
          <div className="form-control sm:col-span-2">
            <label className="label">
              <span className="label-text font-medium">
                {dict.patients.appointmentDescription}
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24 resize-none"
              value={appointmentDescription}
              onChange={(e) => setAppointmentDescription(e.target.value)}
              placeholder={dict.patients.appointmentDescription}
            />
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSaving}>
            {dict.patients.cancel}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              dict.patients.save
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
