import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Round Picks",
  description: "This round's AFL disposal prop predictions - filtered by Edge/Vol, sorted by conviction. HIGH CONVICTION and BET tier picks.",
};

export default function PredictionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
