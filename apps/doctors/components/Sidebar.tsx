"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConversations } from "./chat/useConversations";
import { BillingButton } from "./BillingButton";
import { Locale } from "../app/i18n/config";
import {
  House,
  Users,
  MessageSquare,
  SlidersHorizontal,
  PanelRightOpen,
  Sparkles,
  Crown,
  Clock,
} from "lucide-react";

interface SidebarProps {
  dict: {
    sidebar: {
      dashboard: string;
      calendar: string;
      patients: string;
      chat: string;
      schedule: string;
      settings: string;
      billing?: string;
      planTooltipPro: string;
      planProLabel: string;
      planTooltipFree: string;
      planFreeLabel: string;
      planUpgrade: string;
    };
  };
  lang: Locale;
  showAsPro: boolean;
}

export function Sidebar({ dict, lang, showAsPro }: SidebarProps) {
  const pathname = usePathname();
  const { totalUnread } = useConversations();
  const isChatPage = pathname.includes('/chat');
  const showRedDot = totalUnread > 0 && !isChatPage;

  return (
    <div className="drawer-side is-drawer-close:overflow-visible z-10 border-r border-base-200">
      <label
        htmlFor="dashboard-drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col items-start bg-base-100 is-drawer-close:w-16 is-drawer-open:w-64 transition-all duration-300">
        <div className="w-full p-3 pb-0 flex items-center is-drawer-close:justify-center is-drawer-open:justify-end">
          <label
            htmlFor="dashboard-drawer"
            aria-label="Toggle sidebar"
            className="btn btn-square btn-ghost btn-sm"
          >
            <PanelRightOpen className="transition-transform duration-300 is-drawer-close:rotate-180" />
          </label>
        </div>

        <ul className="menu flex w-full min-h-0 flex-1 flex-col gap-2 p-3">
          <li>
            <Link
              href={`/${lang}/dashboard`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.dashboard}
            >
              <House />
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.dashboard}
              </span>
            </Link>
          </li>

          <li>
            <Link
              href={`/${lang}/dashboard/calendar`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.calendar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.calendar}
              </span>
            </Link>
          </li>

          {/* <li>
            <Link
              href={`/${lang}/dashboard/profile`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.profile}
            >
              <User />
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.profile}
              </span>
            </Link>
          </li> */}

          <li>
            <Link
              href={`/${lang}/dashboard/patients`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.patients}
            >
              <Users />
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.patients}
              </span>
            </Link>
          </li>

          <li>
            <Link
              href={`/${lang}/dashboard/chat`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.chat}
            >
              {/* Icon wrapper — the red dot sits on top of the icon when collapsed */}
              <div className="relative inline-flex shrink-0">
                <MessageSquare />
                {showRedDot && (
                  <span
                    aria-hidden="true"
                    className="is-drawer-open:hidden absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-error animate-heartbeat motion-reduce:animate-none"
                  />
                )}
              </div>
              {/* Label — the red dot sits after the text when expanded */}
              <span className="is-drawer-close:hidden ml-2 flex items-center gap-2">
                {dict.sidebar.chat}
                {showRedDot && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-error animate-heartbeat motion-reduce:animate-none"
                  />
                )}
              </span>
            </Link>
          </li>

          <li>
            <Link
              href={`/${lang}/dashboard/schedule`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.schedule}
            >
              <Clock />
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.schedule}
              </span>
            </Link>
          </li>

          <li>
            <Link
              href={`/${lang}/dashboard/settings`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.settings}
            >
              <SlidersHorizontal />
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.settings}
              </span>
            </Link>
          </li>

          {showAsPro && <BillingButton label={dict.sidebar.billing || "Billing"} />}

          <li className="mt-auto border-t border-base-200 pt-2">
            {showAsPro ? (
              <div
                className="flex items-center rounded-lg px-4 py-2 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip={dict.sidebar.planTooltipPro}
              >
                <Crown className="text-warning shrink-0" aria-hidden />
                <span className="is-drawer-close:hidden ml-2">
                  {dict.sidebar.planProLabel}
                </span>
              </div>
            ) : (
              <div
                className="flex items-start rounded-lg px-4 py-2 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip={dict.sidebar.planTooltipFree}
              >
                <Sparkles className="mt-0.5 shrink-0 opacity-80" aria-hidden />
                <span className="is-drawer-close:hidden ml-2 inline-flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                  <span>{dict.sidebar.planFreeLabel}</span>
                  <Link
                    href={`/${lang}/pricing`}
                    className="link link-primary whitespace-nowrap text-sm"
                  >
                    {dict.sidebar.planUpgrade}
                  </Link>
                </span>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
