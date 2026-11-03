import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { getBarangaySettings } from "@/lib/settings";
import { getContrastColor } from "@/lib/color";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getBarangaySettings();
  return {
    title: { default: `Lahok · ${s.barangay_name}`, template: "%s · Lahok" },
    description: "Open-source event management for Sangguniang Kabataan.",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getBarangaySettings();

  const theme = {
    "--primary": s.primary_color,
    "--primary-foreground": getContrastColor(s.primary_color),
    "--ring": s.primary_color,
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