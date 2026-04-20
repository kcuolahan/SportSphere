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
    "59% filtered win rate across 467 backtested picks. Australia's sharpest AFL disposal model. Six-factor predictions, Edge/Vol filtering, publicly verified track record.",
  keywords: ["AFL", "AFL predictions", "AFL disposals", "AFL analytics", "sports analytics Australia", "AFL disposal model"],
  openGraph: {
    title: "SportSphere — AFL Disposal Analytics",
    description: "59% filtered win rate · 67.7% STRONG tier · 467 picks tracked. Australia's sharpest AFL disposal model.",
    siteName: "SportSphere",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SportSphere — AFL Disposal Analytics. 59% filtered win rate. 67.7% STRONG. 467 picks tracked.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SportSphere — AFL Disposal Analytics",
    description: "59% filtered win rate · 67.7% STRONG tier · 467 picks tracked. Australia's sharpest AFL disposal model.",
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
