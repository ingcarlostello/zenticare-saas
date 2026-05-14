"use client";

import Link from "next/link";
import {
  PanelRightOpen,
  LogOut,
} from "lucide-react";
import { PatientSidebarProps } from "./PatientSidebar.types";
import { usePatientSidebar } from "./usePatientSidebar";
import { SIDEBAR_DRAWER_ID } from "./PatientSidebar.constants";

export function PatientSidebar(props: PatientSidebarProps) {
  const { user, signOut, navItems, initials } = usePatientSidebar(props);

  return (
    <div className="drawer-side is-drawer-close:overflow-visible z-10 border-r border-base-200">
      <label
        htmlFor={SIDEBAR_DRAWER_ID}
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col items-start bg-base-100 is-drawer-close:w-16 is-drawer-open:w-64 transition-all duration-300">
        {/* Toggle button */}
        <div className="w-full p-3 pb-0 flex items-center is-drawer-close:justify-center is-drawer-open:justify-end">
          <label
            htmlFor={SIDEBAR_DRAWER_ID}
            aria-label="Toggle sidebar"
            className="btn btn-square btn-ghost btn-sm"
          >
            <PanelRightOpen className="transition-transform duration-300 is-drawer-close:rotate-180" />
          </label>
        </div>

        {/* Navigation */}
        <ul className="menu flex w-full min-h-0 flex-1 flex-col gap-2 p-3">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${
                  item.isActive ? "active" : ""
                }`}
                data-tip={item.label}
              >
                <div className="relative inline-flex shrink-0">
                  <item.icon size={20} />
                  {item.badge && (
                    <span
                      aria-hidden="true"
                      className="is-drawer-open:hidden absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-error animate-heartbeat motion-reduce:animate-none"
                    />
                  )}
                </div>
                <span className="is-drawer-close:hidden ml-2 flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full bg-error animate-heartbeat motion-reduce:animate-none"
                    />
                  )}
                </span>
              </Link>
            </li>
          ))}

          {/* Bottom section: user info + sign out */}
          <li className="mt-auto border-t border-base-200 pt-2">
            <div className="flex items-center gap-3 px-2 py-2 pointer-events-none">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? ""}
                  className="w-8 h-8 rounded-full shrink-0 pointer-events-none"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
              )}
              <div className="is-drawer-close:hidden min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {user?.fullName ?? user?.firstName ?? ""}
                </p>
                <p className="text-xs opacity-60 truncate">
                  {user?.emailAddresses[0]?.emailAddress ?? ""}
                </p>
              </div>
            </div>
          </li>
          <li>
            <button
              onClick={() => signOut()}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right text-error/70 hover:text-error"
              data-tip="Sign out"
            >
              <LogOut size={18} />
              <span className="is-drawer-close:hidden ml-2">Sign out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
