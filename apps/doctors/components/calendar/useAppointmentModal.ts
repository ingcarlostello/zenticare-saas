"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "@repo/database/convex/_generated/dataModel";
import { CalendarEvent } from "./calendar.types";

interface UseAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { start: Date; end: Date } | null;
  selectedEvent: CalendarEvent | null;
}

export function useAppointmentModal({
  isOpen,
  onClose,
  selectedSlot,
  selectedEvent,
}: UseAppointmentModalProps) {
  const [title, setTitle] = useState("");
  const [patientId, setPatientId] = useState<Id<"patients"> | "">("");
  
  const patients = useQuery(api.patients.listByDoctor);
  const createAppointment = useMutation(api.appointments.create);
  const updateAppointment = useMutation(api.appointments.update);
  const removeAppointment = useMutation(api.appointments.remove);
  
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (selectedEvent) {
        setTitle(selectedEvent.title);
        setPatientId(selectedEvent.patientId || "");
      } else {
        setTitle("");
        setPatientId("");
      }
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, selectedEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !patientId) return;

    try {
      if (selectedEvent && selectedEvent._id) {
        // Edit existing
        await updateAppointment({
          appointmentId: selectedEvent._id,
          title,
          patientId: patientId as Id<"patients">,
        });
      } else if (selectedSlot) {
        // Create new
        await createAppointment({
          title,
          patientId: patientId as Id<"patients">,
          start: selectedSlot.start.getTime(),
          end: selectedSlot.end.getTime(),
          status: "scheduled",
          color: "primary",
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save appointment", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?._id) return;
    
    try {
      await removeAppointment({
        appointmentId: selectedEvent._id,
      });
      onClose();
    } catch (error) {
      console.error("Failed to delete appointment", error);
    }
  };

  const displayStart = selectedEvent ? selectedEvent.start : selectedSlot?.start;
  const displayEnd = selectedEvent ? selectedEvent.end : selectedSlot?.end;

  return {
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
    isSubmitting: false, // Could add actual loading state if mutation returns a promise we track
  };
}
