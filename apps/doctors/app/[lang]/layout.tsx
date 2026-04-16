import { ThemeProvider } from "@repo/ui/ThemeProvider";
import { ThemeSwitcher } from "@repo/ui/ThemeSwitcher";
import { LanguageSwitcher } from "@repo/ui/LanguageSwitcher";
import { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/get-dictionary";
import { Show, UserButton } from "@clerk/nextjs";
import localFont from "next/font/local";
import "../globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-base-100 text-base-content`}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <header className="p-4 flex items-center justify-end gap-2 border-b border-base-200">
            <LanguageSwitcher />
            <ThemeSwitcher label={dict.page.themeList} />
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
