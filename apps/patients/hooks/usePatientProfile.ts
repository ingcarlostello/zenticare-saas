"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";

export function usePatientProfile() {
  const profile = useQuery(api.patientPortal.getMyProfile);
  const updateProfile = useMutation(api.patientPortal.updateMyProfile);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    dateOfBirth: "",
    bloodType: "",
    allergies: [] as string[],
    insuranceProvider: "",
    insurancePolicyNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [allergyInput, setAllergyInput] = useState("");

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        dateOfBirth: profile.dateOfBirth ?? "",
        bloodType: profile.bloodType ?? "",
        allergies: profile.allergies ?? [],
        insuranceProvider: profile.insuranceProvider ?? "",
        insurancePolicyNumber: profile.insurancePolicyNumber ?? "",
        emergencyContactName: profile.emergencyContactName ?? "",
        emergencyContactPhone: profile.emergencyContactPhone ?? "",
        emergencyContactRelationship: profile.emergencyContactRelationship ?? "",
      });
    }
  }, [profile]);

  const updateField = useCallback(
    <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setSaveStatus("idle");
    },
    []
  );

  const addAllergy = useCallback(() => {
    const trimmed = allergyInput.trim();
    if (trimmed && !formData.allergies.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, trimmed],
      }));
      setAllergyInput("");
      setSaveStatus("idle");
    }
  }, [allergyInput, formData.allergies]);

  const removeAllergy = useCallback((allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
    setSaveStatus("idle");
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [formData, updateProfile]);

  return {
    profile,
    formData,
    updateField,
    allergyInput,
    setAllergyInput,
    addAllergy,
    removeAllergy,
    handleSave,
    isSaving,
    saveStatus,
    isLoading: profile === undefined,
  };
}
