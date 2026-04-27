import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
    "67.6% HC win rate. $18,760 gross profit. 71 HC picks tracked. Australia's sharpest AFL disposal model. Six-factor predictions, Edge/Vol filtering, publicly verified track record.",
  keywords: ["AFL", "AFL predictions", "AFL disposals", "AFL analytics", "sports analytics Australia", "AFL disposal model"],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/logo.svg",
  },
  openGraph: {
    title: "SportSphere HQ — AFL Disposal Analytics",
    description: "67.6% HC win rate · $18,760 gross profit · 71 HC picks tracked. Australia's sharpest AFL disposal model.",
    siteName: "SportSphere HQ",
    locale: "en_AU",
    type: "website",
    url: "https://www.sportspherehq.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SportSphere HQ — AFL Disposal Analytics. 67.6% HC win rate. $18,760 gross profit.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SportSphere HQ — AFL Disposal Analytics",
    description: "67.6% HC win rate · $18,760 gross profit · 71 HC picks. Australia's sharpest AFL disposal model.",
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
      <body className="min-h-full flex flex-col bg-black">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());
              gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}',{page_path:window.location.pathname});
            `}</Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
