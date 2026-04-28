import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weight Optimisation Simulator",
  description: "Backtest the AFL disposal model with custom weight configurations across historical predictions. Find the optimal model parameters in real time.",
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
