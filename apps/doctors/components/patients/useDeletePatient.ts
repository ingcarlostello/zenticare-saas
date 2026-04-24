"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import type { UseDeletePatientProps } from "./patients.types";


export function useDeletePatient({ patientId, onClose }: UseDeletePatientProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const removePatient = useMutation(api.patients.remove);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!patientId) return;
    setIsDeleting(true);
    try {
      await removePatient({ patientId });
      onClose();
    } catch (error) {
      console.error("Error deleting patient:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    dialogRef,
    isDeleting,
    handleDelete,
  };
}
