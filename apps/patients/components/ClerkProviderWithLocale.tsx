"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { enUS, esES, frFR, ptBR } from "@clerk/localizations";
import { usePathname } from "next/navigation";

const localeMap: Record<string, typeof enUS> = {
  en: enUS,
  es: esES,
  fr: frFR,
  pt: ptBR,
};

function getClerkLocaleFromPathname(pathname: string) {
  const lang = pathname.split("/")[1] || "en";
  return localeMap[lang] || enUS;
}

export function ClerkProviderWithLocale({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const localization = getClerkLocaleFromPathname(pathname);

  return (
    <ClerkProvider localization={localization}>
      {children}
    </ClerkProvider>
  );
}

