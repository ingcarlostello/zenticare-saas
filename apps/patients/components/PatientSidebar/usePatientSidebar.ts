"use client";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@repo/database/convex/_generated/api";
import { useClerk, useUser } from "@clerk/nextjs";
import { House, CalendarDays, MessageSquare, User } from "lucide-react";
import { PatientSidebarProps } from "./PatientSidebar.types";

export function usePatientSidebar({ dict, lang }: PatientSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const unreadCount = useQuery(api.patientPortal.getMyUnreadCount) ?? 0;

  const isChatPage = pathname.includes("/chat");
  const showRedDot = unreadCount > 0 && !isChatPage;

  const navItems = [
    {
      href: `/${lang}/dashboard`,
      label: dict.sidebar.home,
      icon: House,
      isActive: pathname === `/${lang}/dashboard`,
    },
    {
      href: `/${lang}/dashboard/appointments`,
      label: dict.sidebar.appointments,
      icon: CalendarDays,
      isActive: pathname.includes("/dashboard/appointments"),
    },
    {
      href: `/${lang}/dashboard/chat`,
      label: dict.sidebar.chat,
      icon: MessageSquare,
      isActive: isChatPage,
      badge: showRedDot,
    },
    {
      href: `/${lang}/dashboard/profile`,
      label: dict.sidebar.profile,
      icon: User,
      isActive: pathname.includes("/dashboard/profile"),
    },
  ];

  const initials = user
    ? `${(user.firstName?.[0] ?? "").toUpperCase()}${(user.lastName?.[0] ?? "").toUpperCase()}` ||
      user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ||
      "?"
    : "?";

  return {
    user,
    signOut,
    navItems,
    initials,
  };
}
