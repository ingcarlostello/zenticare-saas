"use client";

import { useQuery, useMutation, useAction } from "convex/react";
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
  
  const createGoogleEvent = useAction(api.googleCalendarActions.createEvent);
  const updateGoogleEvent = useAction(api.googleCalendarActions.updateEvent);
  const deleteGoogleEvent = useAction(api.googleCalendarActions.deleteEvent);
  
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

        if (selectedEvent.googleEventId) {
          await updateGoogleEvent({
            googleEventId: selectedEvent.googleEventId,
            title,
            start: selectedEvent.start.getTime(),
            end: selectedEvent.end.getTime(),
          }).catch(console.error);
        }
      } else if (selectedSlot) {
        // Create new
        const newAppointmentId = await createAppointment({
          title,
          patientId: patientId as Id<"patients">,
          start: selectedSlot.start.getTime(),
          end: selectedSlot.end.getTime(),
          status: "scheduled",
          color: "primary",
        });

        if (newAppointmentId) {
          await createGoogleEvent({
            appointmentId: newAppointmentId,
            title,
            start: selectedSlot.start.getTime(),
            end: selectedSlot.end.getTime(),
          }).catch(console.error);
        }
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

      if (selectedEvent.googleEventId) {
        await deleteGoogleEvent({
          googleEventId: selectedEvent.googleEventId
        }).catch(console.error);
      }

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
