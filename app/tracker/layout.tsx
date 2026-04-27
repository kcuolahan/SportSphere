import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bet Tracker",
  description: "Log and track your AFL disposal prop bets. Monitor P&L, win rate and ROI - stored locally in your browser.",
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
