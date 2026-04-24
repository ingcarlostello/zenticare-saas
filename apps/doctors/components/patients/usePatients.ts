"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import type { Doc } from "@repo/database/convex/_generated/dataModel";

export function usePatients() {
  const patients = useQuery(api.patients.listByDoctor);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Doc<"patients"> | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Doc<"patients"> | null>(null);

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [patients, search]);

  const handleAddPatient = () => {
    setEditingPatient(null);
    setModalOpen(true);
  };

  const handleEditPatient = (patient: Doc<"patients">) => {
    setEditingPatient(patient);
    setModalOpen(true);
  };

  const handleDeletePatient = (patient: Doc<"patients">) => {
    setDeletingPatient(patient);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPatient(null);
  };

  const handleCloseDelete = () => {
    setDeletingPatient(null);
  };

  return {
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
    isLoading: patients === undefined,
  };
}
