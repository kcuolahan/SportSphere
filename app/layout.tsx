import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "SportSphere — AFL Disposal Analytics | Australia's Sharpest Model",
    template: "%s | SportSphere",
  },
  description:
    "Predictive AFL disposal analytics powered by a six-factor model, Edge/Vol filtering, and a publicly verified track record. Built for serious Australian AFL bettors.",
  keywords: ["AFL", "AFL predictions", "AFL disposals", "AFL analytics", "sports analytics Australia"],
  openGraph: {
    title: "SportSphere — AFL Disposal Analytics",
    description: "Australia's sharpest AFL disposal model. Six-factor predictions, Edge/Vol filtering, verified track record.",
    siteName: "SportSphere",
    locale: "en_AU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}
