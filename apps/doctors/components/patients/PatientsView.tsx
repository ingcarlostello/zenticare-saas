"use client";

import { Users, UserPlus, Search, UserRound } from "lucide-react";
import { PatientModal } from "./PatientModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { usePatients } from "./usePatients";
import { PatientsTable } from "./PatientsTable";
import { PatientsMobileCards } from "./PatientsMobileCards";
import type { PatientsViewProps } from "./patients.types";

export function PatientsView({ dict }: PatientsViewProps) {
  const {
    patients,
    filteredPatients,
    search,
    setSearch,
    modalOpen,
    editingPatient,
    deletingPatient,
    handleAddPatient,
    handleEditPatient,
    handleDeletePatient,
    handleCloseModal,
    handleCloseDelete,
    isLoading,
  } = usePatients();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-4 border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{dict.patients.totalPatients}</h1>
            {!isLoading && patients && (
              <p className="text-sm opacity-60">
                {patients.length} {dict.patients.title.toLowerCase()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <label className="input input-bordered flex items-center gap-2 flex-1 sm:flex-none sm:w-72">
            <Search className="w-4 h-4 opacity-50" />
            <input
              type="text"
              className="grow"
              placeholder={dict.patients.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {/* Add Patient Button */}
          <button className="btn btn-primary" onClick={handleAddPatient}>
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.patients.addPatient}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-base-200 mb-4">
              <UserRound className="w-12 h-12 opacity-30" />
            </div>
            <p className="text-lg font-semibold opacity-60">{dict.patients.noPatients}</p>
            <p className="text-sm opacity-40 mt-1">{dict.patients.noPatientsDesc}</p>
          </div>
        ) : (
          <>
            <PatientsTable
              dict={dict}
              patients={filteredPatients}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
            <PatientsMobileCards
              dict={dict}
              patients={filteredPatients}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <PatientModal
          dict={dict}
          patient={editingPatient}
          onClose={handleCloseModal}
        />
      )}
      {deletingPatient && (
        <DeleteConfirmModal
          dict={dict}
          patientId={deletingPatient._id}
          patientName={deletingPatient.fullName}
          onClose={handleCloseDelete}
        />
      )}
    </div>
  );
}
