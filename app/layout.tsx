import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { getBarangaySettings } from "@/lib/settings";
import { getContrastColor } from "@/lib/color";
import "./globals.css";
import { getBranding } from "@/lib/branding";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = getBranding(await getBarangaySettings());

  return {
    title: { default: branding.metaTitle, template: "%s · Lahok" },
    description: branding.metaDescription,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getBarangaySettings();

  const theme = {
    "--primary": s.primary_color,
    "--primary-foreground": getContrastColor(s.primary_color),
    "--ring": s.primary_color,
    "--sidebar-primary": s.primary_color,
    "--sidebar-primary-foreground": getContrastColor(s.primary_color),
  } as CSSProperties;

  return (
    <html
      lang="en"
      style={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
