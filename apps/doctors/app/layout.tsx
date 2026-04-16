import { ClerkProviderWithLocale } from "./components/ClerkProviderWithLocale";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWithLocale>
      {children}
    </ClerkProviderWithLocale>
  );
}
