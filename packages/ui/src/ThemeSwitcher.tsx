"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="btn btn-ghost btn-sm btn-square" />;
  }

  const themes = [
    { name: "light", label: "light" },
    { name: "dark", label: "dark" },
    { name: "kree", label: "kree" },
    { name: "marfil", label: "marfil" },
    { name: "blue1", label: "blue1" },
    { name: "nextnpc", label: "nextnpc" },
  ];

  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-ghost btn-sm gap-1">
        Theme list
        <svg
          width="12"
          height="12"
          className="h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
        </svg>
      </summary>

      <div className="dropdown-content bg-base-100 p-3 rounded-box z-[1] w-30 shadow-lg mt-2 border border-base-200">
        <ul className="menu menu-sm max-h-72 overflow-y-auto flex-nowrap p-2 pt-0">
          {themes.map((t) => (
            <li className="my-1" key={t.name}>
              <button
                className={`flex items-center gap-3 ${theme === t.name ? "active" : ""}`}
                onClick={() => {
                  setTheme(t.name);
                  const el = (document.activeElement as HTMLElement)?.closest("details");
                  if (el) el.removeAttribute("open");
                }}
              >
                <span className="flex-1">{t.label}</span>
                {theme === t.name && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-success"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
