"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { ChevronDown, Check, Palette } from "lucide-react";
import { useDetailsDropdown } from "./hooks/useDetailsDropdown";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { detailsRef, closeDropdown } = useDetailsDropdown();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="btn btn-ghost btn-sm btn-square" />;
  }

  const themes = [
    { name: "light", label: "light" },
    { name: "dark", label: "dark" },
    { name: "jumpingstudio", label: "jumpingstudio" },
    { name: "paperstar", label: "paperstar" },
    { name: "electroview", label: "electroview" },
    { name: "nextnpc", label: "nextnpc" },
    { name: "cupcake", label: "cupcake" },
    { name: "emerald", label: "emerald" },
    { name: "corporate", label: "corporate" },
    { name: "pastel", label: "pastel" },
    { name: "fantasy", label: "fantasy" },
    { name: "lemonade", label: "lemonade" },
    { name: "winter", label: "winter" },
  ];

  return (
    <details ref={detailsRef} className="dropdown dropdown-end">
      <summary className="btn gap-1">
        <Palette size={16}/>
        <ChevronDown size={16}/>
      </summary>

      <div className="dropdown-content border-solid bg-base-100 p-3 rounded-box z-[1] w-auto shadow-lg mt-2 border border-base-200">
        <ul className="menu menu-sm max-h-72 overflow-y-auto flex-nowrap p-2 pt-0">
          {themes.map((t) => (
            <li className="my-1" key={t.name}>
              <button
                className={`flex items-center gap-3 ${theme === t.name ? "active" : ""}`}
                onClick={() => {
                  setTheme(t.name);
                  closeDropdown();
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
