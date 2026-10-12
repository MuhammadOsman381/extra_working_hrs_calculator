import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/src/components/theme/theme-provider";
import { defaultPalette, paletteStorageKey, palettes } from "@/src/lib/palettes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Extra Hours Counter",
  description: "Track work, breaks, extra hours, and monthly exports.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-palette={defaultPalette}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => { try { const t = localStorage.getItem("extra-hours-theme") || "dark"; const r = t === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : t; const key = ${JSON.stringify(paletteStorageKey)}; const fallback = ${JSON.stringify(defaultPalette)}; const valid = ${JSON.stringify(palettes.map((item) => item.id))}; const p = localStorage.getItem(key); document.documentElement.dataset.theme = r; document.documentElement.dataset.palette = valid.includes(p) ? p : fallback; } catch { document.documentElement.dataset.theme = "dark"; document.documentElement.dataset.palette = ${JSON.stringify(defaultPalette)}; } })();`}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
