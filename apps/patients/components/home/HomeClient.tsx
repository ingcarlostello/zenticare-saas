"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { CalendarDays, MessageSquare, ChevronRight } from "lucide-react";
import { AppointmentCard } from "../appointments/AppointmentCard";

interface HomeClientProps {
  dict: Record<string, any>;
  lang: string;
}

export function HomeClient({ dict, lang }: HomeClientProps) {
  const { user } = useUser();
  const profile = useQuery(api.patientPortal.getMyProfile);
  const upcoming = useQuery(api.patientPortal.getUpcomingAppointments, { limit: 3 });

  const firstName = user?.firstName ?? profile?.fullName?.split(" ")[0] ?? "";
  const t = dict.home ?? {};

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {(t.greeting ?? "Hello, {name} 👋").replace("{name}", firstName)}
        </h1>
        <p className="mt-1 text-base-content/60">
          {t.subtitle ?? "Your health, up to date, all in one place."}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href={`/${lang}/dashboard/appointments`}
          className="card card-border bg-base-100 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-body items-center text-center py-6">
            <CalendarDays className="w-8 h-8 text-primary mb-2" />
            <span className="font-semibold text-sm">
              {t.quickAppointments ?? "My Appointments"}
            </span>
          </div>
        </Link>

        <Link
          href={`/${lang}/dashboard/chat`}
          className="card card-border bg-base-100 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-body items-center text-center py-6">
            <MessageSquare className="w-8 h-8 text-primary mb-2" />
            <span className="font-semibold text-sm">
              {t.quickChat ?? "Chat"}
            </span>
          </div>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-primary">⏳</span>
            {t.upcomingTitle ?? "Upcoming Appointments"}
          </h2>
          <Link
            href={`/${lang}/dashboard/appointments`}
            className="link link-primary text-sm flex items-center gap-1"
          >
            {t.viewAll ?? "View all"}
            <ChevronRight size={14} />
          </Link>
        </div>

        {upcoming === undefined ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card card-border bg-base-100">
            <div className="card-body items-center text-center py-10">
              <CalendarDays className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-base-content/60">
                {t.noUpcoming ?? "No upcoming appointments"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((apt: any) => (
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
    </div>
  );
}
