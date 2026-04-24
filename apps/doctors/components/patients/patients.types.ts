import type { Doc, Id } from "@repo/database/convex/_generated/dataModel";

export interface PatientsViewProps {
  dict: any;
}

export interface DeleteConfirmModalProps {
  dict: any;
  patientId: Id<"patients"> | null;
  patientName: string;
  onClose: () => void;
}

export interface PatientModalProps {
  dict: any;
  patient: Doc<"patients"> | null;
  onClose: () => void;
}

export interface UseDeletePatientProps {
  patientId: Id<"patients"> | null;
  onClose: () => void;
}

export interface UsePatientFormProps {
  patient: Doc<"patients"> | null;
  onClose: () => void;
}

export interface PatientsTableProps {
  dict: any;
  patients: Doc<"patients">[];
  onEdit: (patient: Doc<"patients">) => void;
  onDelete: (patient: Doc<"patients">) => void;
}

export interface PatientsMobileCardsProps {
  dict: any;
  patients: Doc<"patients">[];
  onEdit: (patient: Doc<"patients">) => void;
  onDelete: (patient: Doc<"patients">) => void;
}
