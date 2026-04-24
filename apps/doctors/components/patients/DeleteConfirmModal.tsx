"use client";

import { useDeletePatient } from "./useDeletePatient";
import type { DeleteConfirmModalProps } from "./patients.types";

export function DeleteConfirmModal({
  dict,
  patientId,
  patientName,
  onClose,
}: DeleteConfirmModalProps) {
  const { dialogRef, isDeleting, handleDelete } = useDeletePatient({
    patientId,
    onClose,
  });

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-open"
      onClose={onClose}
    >
      <div className="modal-box">
        <h3 className="text-lg font-bold">{dict.patients.confirmDeleteTitle}</h3>
        <p className="py-4">
          {dict.patients.confirmDelete}
        </p>
        <p className="font-semibold text-base-content/80">{patientName}</p>
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            {dict.patients.no}
          </button>
          <button
            className="btn btn-error"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              dict.patients.yes
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
