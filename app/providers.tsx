"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

const ThemeProviderFix = ThemeProvider as React.ComponentType<{
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  children?: React.ReactNode;
}>;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderFix attribute="class" defaultTheme="light" enableSystem={false}>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProviderFix>
  );
}