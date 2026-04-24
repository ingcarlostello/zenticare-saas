import { ClerkProviderWithLocale } from "./components/ClerkProviderWithLocale";
import { ConvexClientProvider } from "./components/ConvexClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWithLocale>
      <ConvexClientProvider>
        {children}
      </ConvexClientProvider>
    </ClerkProviderWithLocale>
  );
}
