import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { AppointmentsClientProps, UseAppointmentsClientReturn } from "./AppointmentsClient.types";

export function useAppointmentsClient({ dict }: Pick<AppointmentsClientProps, "dict">): UseAppointmentsClientReturn {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const allAppointments = useQuery(api.patientPortal.listMyAppointments);

  const t = dict.appointments ?? {};
  const now = Date.now();

  const upcoming = (allAppointments ?? [])
    .filter((apt: any) => apt.start >= now && apt.status !== "cancelled")
    .sort((a: any, b: any) => a.start - b.start);

  const history = (allAppointments ?? [])
    .filter((apt: any) => apt.start < now || apt.status === "cancelled")
    .sort((a: any, b: any) => b.start - a.start);

  const activeList = activeTab === "upcoming" ? upcoming : history;

  return {
    activeTab,
    setActiveTab,
    activeList,
    upcomingCount: upcoming.length,
    historyCount: history.length,
    isLoading: allAppointments === undefined,
    t,
  };
}
