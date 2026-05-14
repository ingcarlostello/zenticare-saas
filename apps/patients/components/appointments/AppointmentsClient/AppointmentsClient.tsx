"use client";

import { CalendarDays, Plus } from "lucide-react";
import { AppointmentCard } from "../AppointmentCard";
import { useAppointmentsClient } from "./useAppointmentsClient";
import { AppointmentsClientProps } from "./AppointmentsClient.types";

export function AppointmentsClient(props: AppointmentsClientProps) {
  const { dict, lang } = props;
  const {
    activeTab,
    setActiveTab,
    activeList,
    upcomingCount,
    historyCount,
    isLoading,
    t,
  } = useAppointmentsClient(props);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {t.title ?? "My Appointments"}
          </h1>
          <p className="mt-1 text-base-content/60">
            {t.subtitle ?? "Manage your medical appointments"}
          </p>
        </div>
        <button className="btn btn-primary btn-sm md:btn-md gap-2" disabled>
          <Plus size={16} />
          <span className="hidden sm:inline">{t.newAppointment ?? "New Appointment"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button
          className={`btn btn-sm ${activeTab === "upcoming" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("upcoming")}
        >
          {t.upcoming ?? "Upcoming"} ({upcomingCount})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "history" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("history")}
        >
          {t.history ?? "History"} ({historyCount})
        </button>
      </div>

      {/* Appointment list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : activeList.length === 0 ? (
        <div className="card card-border bg-base-100">
          <div className="card-body items-center text-center py-16">
            <CalendarDays className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-base-content/60">
              {t.noAppointments ?? "No appointments to show"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeList.map((apt: any) => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              dict={dict}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
