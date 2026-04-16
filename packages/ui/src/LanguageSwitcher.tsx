"use client";

import { ChevronDown, Check } from "lucide-react";
import { useLanguage } from "./hooks/useLanguage";
import { useDetailsDropdown } from "./hooks/useDetailsDropdown";

export function LanguageSwitcher() {
  const { currentLang, locales, currentLocaleObj, changeLanguage } = useLanguage();
  const { detailsRef, closeDropdown } = useDetailsDropdown();

  const handleSelectLanguage = (code: string) => {
    changeLanguage(code);
    closeDropdown();
  };

  if (!currentLocaleObj) return null;

  return (
    <details ref={detailsRef} className="dropdown dropdown-end">
      <summary className="btn rounded-btn hover:bg-base-200 flex items-center gap-2 px-3 list-none cursor-pointer">
        <span className="text-lg">{currentLocaleObj.flag}</span>
        <span className="hidden sm:inline-block">{currentLocaleObj.label}</span>
        <ChevronDown size={16} />
      </summary>
      <div className="dropdown-content border-solid bg-base-100 p-2 rounded-box z-[50] w-52 shadow-xl mt-2 border border-base-200">
        <ul className="menu menu-sm p-1">
          {locales.map((locale) => (
            <li key={locale.code} className="my-0.5">
              <button
                onClick={() => handleSelectLanguage(locale.code)}
                className={`flex items-center gap-3 px-4 py-2 ${
                  currentLang === locale.code ? "active" : ""
                }`}
              >
                <span className="text-lg leading-none">{locale.flag}</span>
                <span className="flex-1 text-left">{locale.label}</span>
                {currentLang === locale.code && (
                  <Check className="text-success" size={16} strokeWidth={3} />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
