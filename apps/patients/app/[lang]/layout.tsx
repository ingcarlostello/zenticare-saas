import Image from "next/image";
import { ThemeProvider } from "@repo/ui/ThemeProvider";
import { ThemeSwitcher } from "@repo/ui/ThemeSwitcher";
import { LanguageSwitcher } from "@repo/ui/LanguageSwitcher";
import { Show, UserButton } from "@clerk/nextjs";
import localFont from "next/font/local";
import { ClerkProviderWithLocale } from "../../components/ClerkProviderWithLocale";
import { ConvexClientProvider } from "../../components/ConvexClientProvider";
import { InstallPrompt } from "../../components/pwa";
import { getDictionary } from "../i18n/get-dictionary";
import type { Locale } from "../i18n/config";
import type { Metadata, Viewport } from "next";
import "../globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Zenticare — Portal de Pacientes",
  description: "Tu salud, al día, todo en un solo lugar.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zenticare",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#28B485",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
      <head>
        {/* Apple Touch Icon — mandatory for iOS PWA */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen overflow-hidden flex flex-col bg-base-100 text-base-content`}
      >
        <ClerkProviderWithLocale>
          <ConvexClientProvider>
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
              <main className="flex-1 min-h-0 overflow-hidden">{children}</main>

              {/* PWA Install Prompt — floating modal on 1st/2nd visit */}
              <InstallPrompt dict={dict} lang={lang} />
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProviderWithLocale>
      </body>
    </html>
  );
}
