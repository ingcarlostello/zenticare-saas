"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { ChevronDown } from "lucide-react";
import { Check } from "lucide-react";
import { Palette } from "lucide-react";

export function ThemeSwitcher({ label = "Theme list" }: { label?: string }) {
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
      <summary className="btn gap-1">
        <Palette size={16}/>
        <ChevronDown size={16}/>
      </summary>

      <div className="dropdown-content border-solid bg-base-100 p-3 rounded-box z-[1] w-25 shadow-lg mt-2 border border-base-200">
        <ul className="menu menu-sm max-h-72 overflow-y-auto flex-nowrap p-2 pt-0">
          {themes.map((t) => (
            <li className="my-1" key={t.name}>
              <button
                className={`flex items-center gap-3 ${theme === t.name ? "active" : ""}`}
                onClick={() => {
                  setTheme(t.name);
                  const el = (document.activeElement as HTMLElement)?.closest(
                    "details",
                  );
                  if (el) el.removeAttribute("open");
                }}
              >
                <span className="flex-1">{t.label}</span>
                {theme === t.name && (
                  <Check className="text-success" size={16} />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
