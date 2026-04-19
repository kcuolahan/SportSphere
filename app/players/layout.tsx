import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Explorer",
  description: "Search and explore AFL players tracked in the SportSphere disposal model. Filter by team, position, volatility and form trend.",
};

export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
