"use client";

import { useRef, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import type { UsePatientFormProps } from "./patients.types";

export function usePatientForm({ patient, onClose }: UsePatientFormProps) {
  const createPatient = useMutation(api.patients.create);
  const updatePatient = useMutation(api.patients.update);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lastAppointmentDate, setLastAppointmentDate] = useState("");
  const [appointmentDescription, setAppointmentDescription] = useState("");

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (patient) {
      setFullName(patient.fullName);
      setAge(patient.age !== undefined ? String(patient.age) : "");
      setEmail(patient.email);
      setPhone(patient.phone);
      setAddress(patient.address || "");
      setLastAppointmentDate(patient.lastAppointmentDate || "");
      setAppointmentDescription(patient.appointmentDescription || "");
    } else {
      setFullName("");
      setAge("");
      setEmail("");
      setPhone("");
      setAddress("");
      setLastAppointmentDate("");
      setAppointmentDescription("");
    }
    setErrors({});
  }, [patient]);

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!fullName.trim()) newErrors.fullName = true;
    if (!email.trim()) newErrors.email = true;
    if (!phone.trim()) newErrors.phone = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const data = {
        fullName: fullName.trim(),
        age: age.trim() ? Number(age) : undefined,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        lastAppointmentDate: lastAppointmentDate || undefined,
        appointmentDescription: appointmentDescription.trim() || undefined,
      };

      if (patient) {
        await updatePatient({ patientId: patient._id, ...data });
      } else {
        await createPatient(data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
    isEditing: !!patient,
  };
}
