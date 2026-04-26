"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SeedResult {
  status: string;
  message: string;
  picksCount: number;
  picks: Array<{
    player_name: string;
    team: string;
    position: string;
    line: number;
    prediction: string;
    edge_vol: number;
  }>;
}

export default function SeedPicksPage() {
  const [file, setFile] = useState<File | null>(null);
  const [round, setRound] = useState("7");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("round", round);

      const response = await fetch("/api/upload-picks", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setResult(data);
      setFile(null);
      setTimeout(() => router.push("/predictions"), 2500);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#f0f0f0",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Admin
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Seed Round Picks
          </h1>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
            Upload your Excel model file to auto-seed HC picks into Supabase.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Round */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Round Number
            </label>
            <input
              type="number"
              value={round}
              onChange={(e) => setRound(e.target.value)}
              min="1"
              max="27"
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: "1px solid #1f1f1f",
                borderRadius: 6,
                padding: "10px 14px",
                color: "#f0f0f0",
                fontSize: 15,
                fontWeight: 700,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* File */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Excel File (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: file ? "1px solid #f9731640" : "1px solid #1f1f1f",
                borderRadius: 6,
                padding: "10px 14px",
                color: "#f0f0f0",
                fontSize: 13,
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            />
            {file && (
              <div style={{ fontSize: 11, color: "#f97316", marginTop: 6 }}>
                ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </div>
            )}
            <p style={{ fontSize: 11, color: "#444", marginTop: 6 }}>
              Must contain "Enhanced Picks" sheet · HC picks are rows where Signal includes HIGH CONVICTION
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid #7f1d1d",
              borderRadius: 6,
              padding: "14px 16px",
            }}>
              <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid #14532d",
              borderRadius: 6,
              padding: "16px",
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", margin: "0 0 12px" }}>
                ✓ {result.message}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {result.picks.map((p, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#050505",
                    borderRadius: 4,
                    padding: "8px 10px",
                    fontSize: 12,
                  }}>
                    <span style={{ color: "#f0f0f0", fontWeight: 600 }}>{p.player_name}</span>
                    <span style={{ color: "#888" }}>{p.team} · {p.position}</span>
                    <span style={{ color: p.prediction === "OVER" ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                      {p.prediction} {p.line}
                    </span>
                    <span style={{ color: "#60a5fa", fontSize: 11 }}>E/V {p.edge_vol.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Redirecting to predictions…</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !file}
            style={{
              width: "100%",
              background: loading || !file ? "#111" : "#f97316",
              color: loading || !file ? "#444" : "#000",
              border: "none",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 14,
              padding: "14px",
              cursor: loading || !file ? "not-allowed" : "pointer",
              letterSpacing: "0.02em",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Uploading…" : `Seed HC Picks → Round ${round}`}
          </button>
        </form>
      </div>
    </div>
  );
}
