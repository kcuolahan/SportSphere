import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sportstphere.com.au";

export const metadata: Metadata = {
  title: "DvP Rankings | SportSphere",
  description: "AFL Defence vs Position rankings — which teams concede most to MIDs, DEFs, FWDs and RUCKs. Heatmap view, rank badges, and best matchup finder for this round.",
  openGraph: {
    title: "DvP Rankings | SportSphere",
    description: "Find the easiest AFL defensive matchups by position. Updated each round.",
    url: `${BASE}/defence`,
    siteName: "SportSphere",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "DvP Rankings | SportSphere" },
};

export default function DefenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
