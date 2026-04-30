import type { Doc, Id } from "@repo/database/convex/_generated/dataModel";

export interface PatientsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export interface DeleteConfirmModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  patientId: Id<"patients"> | null;
  patientName: string;
  onClose: () => void;
}

export interface PatientModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  patients: Doc<"patients">[];
  onEdit: (patient: Doc<"patients">) => void;
  onDelete: (patient: Doc<"patients">) => void;
}

export interface PatientsMobileCardsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  patients: Doc<"patients">[];
  onEdit: (patient: Doc<"patients">) => void;
  onDelete: (patient: Doc<"patients">) => void;
}
