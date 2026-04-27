import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | SportSphere HQ",
  description: "What SportSphere HQ is, how it works, our track record, and the legal disclaimer. AFL disposal analytics - not financial advice.",
  openGraph: {
    title: "About SportSphere HQ - AFL Disposal Analytics",
    description: "Independent AFL disposal model with a verified track record. Built on real data, not intuition.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About SportSphere HQ",
    description: "Independent AFL disposal analytics model. Verified results, no subscription.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
