import Link from "next/link";
import { BillingButton } from "./BillingButton";
import { Locale } from "../app/i18n/config";
import {
  House,
  User,
  Users,
  MessageSquare,
  SlidersHorizontal,
  PanelRightOpen,
  Sparkles,
  Crown,
} from "lucide-react";

interface SidebarProps {
  dict: any;
  lang: Locale;
  showAsPro: boolean;
}

export function Sidebar({ dict, lang, showAsPro }: SidebarProps) {
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
              href={`/${lang}/dashboard/profile`}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip={dict.sidebar.profile}
            >
              <User />
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.profile}
              </span>
            </Link>
          </li>

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
              <MessageSquare />
              <span className="is-drawer-close:hidden ml-2">
                {dict.sidebar.chat}
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
