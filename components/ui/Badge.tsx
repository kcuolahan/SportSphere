import React from "react";

type SignalType = "HC" | "BET" | "SKIP" | "FWD_NO_BET";
type ConfidenceType = "STRONG" | "MODERATE" | "LEAN";

interface SignalBadgeProps {
  signal: string;
}

interface ConfidenceBadgeProps {
  confidence: string;
}

const SIGNAL_STYLES: Record<string, React.CSSProperties & { label: string }> = {
  HC: {
    background: "#1a0f00",
    border: "1px solid #f9731640",
    color: "#f97316",
    label: "HC",
  },
  BET: {
    background: "#0a1a0a",
    border: "1px solid #22c55e30",
    color: "#22c55e",
    label: "BET",
  },
  SKIP: {
    background: "#111",
    border: "1px solid #1a1a1a",
    color: "#444",
    label: "SKIP",
  },
  FWD_NO_BET: {
    background: "#111",
    border: "1px solid #1a1a1a",
    color: "#444",
    label: "NO BET",
  },
};

const CONFIDENCE_STYLES: Record<string, React.CSSProperties & { label: string }> = {
  STRONG: {
    background: "#1a0f00",
    border: "1px solid #f9731640",
    color: "#f97316",
    label: "STRONG",
  },
  MODERATE: {
    background: "#0a0f1a",
    border: "1px solid #3b82f640",
    color: "#60a5fa",
    label: "MOD",
  },
  LEAN: {
    background: "#111",
    border: "1px solid #1a1a1a",
    color: "#444",
    label: "LEAN",
  },
};

const BASE: React.CSSProperties = {
  display: "inline-block",
  fontSize: 10,
  fontWeight: 700,
  padding: "3px 7px",
  borderRadius: 4,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
};

export function SignalBadge({ signal }: SignalBadgeProps) {
  const key = signal.replace(/[^A-Z_]/g, "").replace("HIGHCONVICTION", "HC").replace("FWDNOBET", "FWD_NO_BET");
  const style = SIGNAL_STYLES[key] || SIGNAL_STYLES.SKIP;
  return (
    <span className={key === "HC" ? "badge-hc" : undefined} style={{ ...BASE, background: style.background, border: style.border as string, color: style.color }}>
      {style.label}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const key = confidence.toUpperCase().replace(/[^A-Z]/g, "").replace("MODERATE", "MODERATE").replace("STRONG", "STRONG").replace("LEAN", "LEAN");
  const style = CONFIDENCE_STYLES[key] || CONFIDENCE_STYLES.LEAN;
  return (
    <span style={{ ...BASE, background: style.background, border: style.border as string, color: style.color }}>
      {style.label}
    </span>
  );
}
