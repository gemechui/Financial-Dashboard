import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial Statement Deep Analysis | Z.ai Analytics",
  description:
    "Audited financial statement deep analysis for FY2023–FY2026. Revenue, profitability, balance sheet, liquidity, ratios, growth and recommendations dashboard.",
  keywords: [
    "Financial analysis",
    "Z.ai Analytics",
    "Audited financials",
    "FY2023-FY2026",
    "Ratios dashboard",
    "Balance sheet",
    "Income statement",
  ],
  authors: [{ name: "Z.ai Analytics" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Financial Statement Deep Analysis",
    description:
      "Four-year audited financial dashboard covering revenue, profitability, capital structure, liquidity, ratios, growth and recommendations.",
    siteName: "Z.ai Analytics",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Statement Deep Analysis",
    description:
      "Audited financial dashboard for FY2023–FY2026 by Z.ai Analytics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
