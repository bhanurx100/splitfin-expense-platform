import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";

import { QueryProviders } from "@/src/providers/query-provider";
import { ThemeProvider } from "@/src/providers/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "SplitFin — Take control, split smart, save more",
  description:
    "A premium fintech experience: track transactions, split expenses with friends, understand categories, and manage every account in one place.",
};

export const viewport: Viewport = {
  themeColor: "#04050f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Root layout — production architecture preserved:
 * - ClerkProvider: required by middleware-protected routes and (auth) pages.
 * - QueryProviders: React Query client for the kept API/feature hooks.
 * - ThemeProvider: Global theme toggle for dark/light mode.
 * Removed: SheetProvider + Toaster (old sheet/toaster UI deleted with the legacy dashboard).
 */
const RootLayout = ({ children }: Readonly<PropsWithChildren>) => {
  return (
    <ClerkProvider>
      <html lang="en" className="dark bg-background">
        <body className="font-sans antialiased">
          <ThemeProvider>
            <QueryProviders>{children}</QueryProviders>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
