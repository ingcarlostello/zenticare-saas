"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState("en");

  // Locales configuration
  const locales = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
  ];

  useEffect(() => {
    // Extract the locale from the pathname (e.g., /es/dashboard -> 'es')
    // Pathname starts with / so segment 1 is the locale
    const segments = pathname.split("/");
    if (segments.length > 1) {
      const possibleLang = segments[1];
      if (possibleLang && locales.some((l) => l.code === possibleLang)) {
        setCurrentLang(possibleLang);
      }
    }
  }, [pathname]);

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    if (!pathname) return;

    const segments = pathname.split("/");
    // Swap out the lang prefix (segment 1)
    if (segments.length > 1 && locales.some((l) => l.code === segments[1])) {
      segments[1] = lang;
    } else {
      // If it doesn't have a structured supported lang (e.g. root /), prefix it
      // But typically middleware redirects to /[lang]/... so it should already have it.
      segments.splice(1, 0, lang);
    }
    router.push(segments.join("/"));
  };

  const currentLocaleObj =
    locales.find((l) => l.code === currentLang) || locales[0];

  if (!currentLocaleObj) return null;

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        role="button"
        className="btn rounded-btn hover:bg-base-200"
      >
        <span className="text-lg">{currentLocaleObj.flag}</span>
        <span className="hidden sm:inline-block">{currentLocaleObj.label}</span>
        <ChevronDown />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow"
      >
        {locales.map((locale) => (
          <li key={locale.code}>
            <a
              onClick={() => handleLanguageChange(locale.code)}
              className={currentLang === locale.code ? "active" : ""}
            >
              <span className="text-lg">{locale.flag}</span>
              {locale.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
