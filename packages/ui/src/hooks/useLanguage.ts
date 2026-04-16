import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export function useLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState("en");

  // Extract the locale from the pathname (e.g., /es/dashboard -> 'es')
  useEffect(() => {
    if (!pathname) return;
    const segments = pathname.split("/");
    if (segments.length > 1) {
      const possibleLang = segments[1];
      if (possibleLang && SUPPORTED_LOCALES.some((l) => l.code === possibleLang)) {
        setCurrentLang(possibleLang);
      }
    }
  }, [pathname]);

  const changeLanguage = useCallback(
    (lang: string) => {
      setCurrentLang(lang);
      if (!pathname) return;

      const segments = pathname.split("/");
      // Swap out the lang prefix (segment 1)
      if (segments.length > 1 && SUPPORTED_LOCALES.some((l) => l.code === segments[1])) {
        segments[1] = lang;
      } else {
        segments.splice(1, 0, lang);
      }
      router.push(segments.join("/"));
    },
    [pathname, router]
  );

  const currentLocaleObj =
    SUPPORTED_LOCALES.find((l) => l.code === currentLang) || SUPPORTED_LOCALES[0];

  return {
    currentLang,
    locales: SUPPORTED_LOCALES,
    currentLocaleObj,
    changeLanguage,
  };
}
