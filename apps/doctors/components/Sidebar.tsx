import Link from "next/link";
import { Locale } from "../app/i18n/config";
import { House, User, MessageSquare, SlidersHorizontal, PanelRightOpen } from "lucide-react";

interface SidebarProps {
  dict: any;
  lang: Locale;
}

export function Sidebar({ dict, lang }: SidebarProps) {
  return (
    <div className="drawer-side is-drawer-close:overflow-visible z-10 border-r border-base-200">
      <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="flex min-h-full flex-col items-start bg-base-100 is-drawer-close:w-16 is-drawer-open:w-64 transition-all duration-300">
        
        <div className="w-full p-3 pb-0 flex items-center is-drawer-close:justify-center is-drawer-open:justify-end">
          <label htmlFor="dashboard-drawer" aria-label="Toggle sidebar" className="btn btn-square btn-ghost btn-sm">
            <PanelRightOpen className="transition-transform duration-300 is-drawer-close:rotate-180"/>
          </label>
        </div>

        <ul className="menu w-full grow gap-2 p-3">
          <li>
            <Link 
              href={`/${lang}/dashboard`} 
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right" 
              data-tip={dict.sidebar.dashboard}
            >
              <House />
              <span className="is-drawer-close:hidden ml-2">{dict.sidebar.dashboard}</span>
            </Link>
          </li>
          
          <li>
            <Link 
              href={`/${lang}/dashboard/profile`} 
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right" 
              data-tip={dict.sidebar.profile}
            >
              <User />
              <span className="is-drawer-close:hidden ml-2">{dict.sidebar.profile}</span>
            </Link>
          </li>

          <li>
            <Link 
              href={`/${lang}/dashboard/chat`} 
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right" 
              data-tip={dict.sidebar.chat}
            >
              <MessageSquare />
              <span className="is-drawer-close:hidden ml-2">{dict.sidebar.chat}</span>
            </Link>
          </li>

          <li>
            <Link 
              href={`/${lang}/dashboard/settings`} 
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right" 
              data-tip={dict.sidebar.settings}
            >
              <SlidersHorizontal />
              <span className="is-drawer-close:hidden ml-2">{dict.sidebar.settings}</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
