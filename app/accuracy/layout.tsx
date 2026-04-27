import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sportspherehq.com";

export const metadata: Metadata = {
  title: "Track Record | SportSphere HQ",
  description: "Complete verified track record of every AFL disposal model pick across Rounds 3 to 7, 2026 season. Full transparency - ROI, MAE, win rates by tier. No cherry picking.",
  openGraph: {
    title: "Track Record | SportSphere HQ",
    description: "Every AFL disposal prediction logged and verified. Full round-by-round results with ROI tracking.",
    url: `${BASE}/accuracy`,
    siteName: "SportSphere HQ",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Track Record | SportSphere HQ" },
};

export default function AccuracyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
