"use client";

import { useUser } from "@clerk/nextjs";
import { usePatientProfile } from "../../hooks/usePatientProfile";
import { Save, Check, X, Plus } from "lucide-react";

interface ProfileClientProps {
  dict: Record<string, any>;
  lang: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function ProfileClient({ dict }: ProfileClientProps) {
  const { user } = useUser();
  const {
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
    isLoading,
  } = usePatientProfile();

  const t = dict.profile ?? {};

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-base-content/60">
          {t.notFound ?? "Profile not found. Please contact your doctor."}
        </p>
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={profile.fullName}
            className="w-16 h-16 rounded-full shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl font-bold shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold truncate">{profile.fullName}</h1>
          <p className="text-base-content/60 text-sm truncate">{profile.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Personal Information */}
        <fieldset className="fieldset border border-base-300 rounded-box p-4">
          <legend className="fieldset-legend text-sm font-semibold">
            {t.personalInfo ?? "Personal Information"}
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.fullName ?? "Full name"}</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={profile.fullName}
                disabled
              />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.email ?? "Email"}</span></label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={profile.email}
                disabled
              />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.phone ?? "Phone"}</span></label>
              <input
                type="tel"
                className="input input-bordered w-full"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.dateOfBirth ?? "Date of birth"}</span></label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label"><span className="label-text text-xs opacity-60">{t.address ?? "Address"}</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Av. Principal 123, Col. Centro"
              />
            </div>
          </div>
        </fieldset>

        {/* Medical Information */}
        <fieldset className="fieldset border border-base-300 rounded-box p-4">
          <legend className="fieldset-legend text-sm font-semibold">
            {t.medicalInfo ?? "Medical Information"}
          </legend>
          <div className="flex flex-col gap-4">
            <div className="max-w-xs">
              <label className="label"><span className="label-text text-xs opacity-60">{t.bloodType ?? "Blood type"}</span></label>
              <select
                className="select select-bordered w-full"
                value={formData.bloodType}
                onChange={(e) => updateField("bloodType", e.target.value)}
              >
                <option value="">—</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.allergies ?? "Allergies"}</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="badge badge-soft badge-primary gap-1"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeAllergy(allergy)}
                      className="cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                  placeholder={t.addAllergy ?? "Add allergy..."}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm self-center"
                  onClick={addAllergy}
                  disabled={!allergyInput.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Insurance */}
        <fieldset className="fieldset border border-base-300 rounded-box p-4">
          <legend className="fieldset-legend text-sm font-semibold">
            {t.insurance ?? "Medical Insurance"}
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.insuranceProvider ?? "Insurance provider"}</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.insuranceProvider}
                onChange={(e) => updateField("insuranceProvider", e.target.value)}
                placeholder="GNP Seguros"
              />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.policyNumber ?? "Policy number"}</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.insurancePolicyNumber}
                onChange={(e) => updateField("insurancePolicyNumber", e.target.value)}
                placeholder="POL-2024-78542"
              />
            </div>
          </div>
        </fieldset>

        {/* Emergency Contact */}
        <fieldset className="fieldset border border-base-300 rounded-box p-4">
          <legend className="fieldset-legend text-sm font-semibold">
            {t.emergencyContact ?? "Emergency Contact"}
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.contactName ?? "Name"}</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.emergencyContactName}
                onChange={(e) => updateField("emergencyContactName", e.target.value)}
              />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.contactPhone ?? "Phone"}</span></label>
              <input
                type="tel"
                className="input input-bordered w-full"
                value={formData.emergencyContactPhone}
                onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
              />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs opacity-60">{t.contactRelationship ?? "Relationship"}</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.emergencyContactRelationship}
                onChange={(e) => updateField("emergencyContactRelationship", e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 mt-2 mb-8">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-sm text-success">
              <Check size={16} />
              {t.saved ?? "Changes saved successfully"}
            </span>
          )}
          <button
            className="btn btn-primary gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? (t.saving ?? "Saving...") : (t.saveChanges ?? "Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
