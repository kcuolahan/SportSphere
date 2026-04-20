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
    default: "SportSphere HQ — AFL Disposal Analytics | Australia's Sharpest Model",
    template: "%s | SportSphere HQ",
  },
  description:
    "60.7% HC win rate across 611 verified picks. Australia's sharpest AFL disposal model. Six-factor predictions, Edge/Vol filtering, publicly verified track record.",
  keywords: ["AFL", "AFL predictions", "AFL disposals", "AFL analytics", "sports analytics Australia", "AFL disposal model"],
  openGraph: {
    title: "SportSphere HQ — AFL Disposal Analytics",
    description: "60.7% HC win rate · 60.0% filtered · 611 picks tracked. Australia's sharpest AFL disposal model.",
    siteName: "SportSphere HQ",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SportSphere HQ — AFL Disposal Analytics. 60.7% HC win rate. 611 picks tracked.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SportSphere HQ — AFL Disposal Analytics",
    description: "60.7% HC win rate · 60.0% filtered · 611 picks tracked. Australia's sharpest AFL disposal model.",
    images: ["/og-image.png"],
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
