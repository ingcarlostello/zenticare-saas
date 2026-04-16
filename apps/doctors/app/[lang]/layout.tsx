import Image from "next/image";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-base-100 text-base-content`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          <header className="p-4 flex items-center justify-between gap-2 border-b border-base-200">
            <div className="flex items-center gap-2 select-none ml-8">
              <div className="flex items-center justify-center bg-[#28B485] p-2 rounded-xl shadow-sm">
                <Image
                  src="/zenticareLogoTransparent.ico"
                  alt="Zenticare Logo"
                  width={28}
                  height={28}
                  className="brightness-0 invert"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-base-content">
                Zenticare
              </span>
            </div>

            <div className="flex items-center gap-2 mr-8">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
