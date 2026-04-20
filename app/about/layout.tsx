import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | SportSphere",
  description: "What SportSphere is, how it works, our track record, and the legal disclaimer. AFL disposal analytics — not financial advice.",
  openGraph: {
    title: "About SportSphere — AFL Disposal Analytics",
    description: "Independent AFL disposal model with a verified track record. Built on real data, not intuition.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About SportSphere",
    description: "Independent AFL disposal analytics model. Verified results, no subscription.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
