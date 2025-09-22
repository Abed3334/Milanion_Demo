import type { Metadata } from "next";
import "./globals.css";
import { MarketProvider } from "./context/MarketContext";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = { title: "Melanion Demo", description: "Crypto Trading Platform Demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <MarketProvider>{children}</MarketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
