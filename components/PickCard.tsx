"use client";

interface Pick {
  id?: string;
  playerName?: string;
  player?: string;
  team: string;
  position: string;
  line?: number;
  bookie_line?: number;
  prediction?: string;
  direction?: string;
  edgeVol?: number;
  edge_vol?: number;
  tier?: string;
  finalDisposals?: number | null;
  result?: string | null;
  profitLoss?: number | null;
  odds?: number;
}

interface Props {
  pick: Pick;
}

export function PickCard({ pick }: Props) {
  const name = pick.playerName ?? pick.player ?? "Unknown";
  const line = pick.line ?? pick.bookie_line ?? 0;
  const direction = pick.prediction ?? pick.direction ?? "OVER";
  const ev = pick.edgeVol ?? pick.edge_vol ?? 0;
  const resultColor = pick.result === "WIN" ? "#4ade80" : pick.result === "LOSS" ? "#ef4444" : "transparent";
  const isOver = direction === "OVER";

  return (
    <div style={{
      position: "relative",
      background: "#080808",
      border: "1px solid #1a1a1a",
      borderRadius: 10,
      padding: "16px 20px",
    }}>
      {/* Result badge */}
      {pick.result && (
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "4px 10px",
          background: "#0a0a0a",
          border: `1px solid ${resultColor}40`,
          borderRadius: 6,
          textAlign: "right",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: resultColor }}>
            {pick.result}{" "}
            {pick.result === "WIN" ? "+" : ""}
            ${(pick.profitLoss ?? 0).toLocaleString()}
          </div>
          {pick.finalDisposals != null && (
            <div style={{ fontSize: 10, color: "#666" }}>{pick.finalDisposals} disp</div>
          )}
        </div>
      )}

      {/* Player info */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 12, color: "#666" }}>{pick.team} · {pick.position}</div>
      </div>

      {/* Pick metrics */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Line</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>{line}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Direction</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: isOver ? "#22c55e" : "#ef4444" }}>
            {direction} {isOver ? "⬆" : "⬇"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>E/V</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa" }}>{ev.toFixed(2)}</div>
        </div>
        {pick.tier && (
          <div style={{
            fontSize: 9, fontWeight: 800, color: "#f97316",
            background: "#f9731618", border: "1px solid #f9731640",
            borderRadius: 4, padding: "3px 8px", letterSpacing: "0.06em",
          }}>
            {pick.tier}
          </div>
        )}
      </div>
    </div>
  );
}
