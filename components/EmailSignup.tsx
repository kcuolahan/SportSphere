"use client";

import { useState } from "react";

interface EmailSignupProps {
  round: number;
  variant?: "hero" | "footer";
}

export function EmailSignup({ round, variant = "hero" }: EmailSignupProps) {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong — try again");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong — try again");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        background: "#030f08", border: "1px solid #14532d",
        borderRadius: 10, padding: "14px 20px",
      }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <span style={{ fontSize: 14, color: "#4ade80", fontWeight: 600 }}>
          You&apos;re in — check your inbox
        </span>
      </div>
    );
  }

  const isFooter = variant === "footer";

  return (
    <div style={{ maxWidth: isFooter ? 480 : 520 }}>
      {/* Heading */}
      <h3 style={{
        fontSize: isFooter ? 16 : 18,
        fontWeight: 700,
        color: "#f0f0f0",
        margin: "0 0 6px",
        letterSpacing: "-0.02em",
      }}>
        Get Round {round} picks in your inbox — free during beta
      </h3>
      <p style={{ fontSize: 13, color: "#555", margin: "0 0 16px", lineHeight: 1.6 }}>
        Join others getting the sharpest AFL disposal picks each week.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "11px 14px",
            background: "#0a0a0a",
            border: "1px solid #1f1f1f",
            borderRadius: 8,
            color: "#f0f0f0",
            fontSize: 14,
            outline: "none",
            opacity: status === "loading" ? 0.6 : 1,
          }}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          style={{
            padding: "11px 20px",
            background: status === "loading" ? "#7c3412" : "#f97316",
            color: "#000",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
            opacity: !email.trim() ? 0.5 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {status === "loading" && (
            <span style={{
              width: 14, height: 14, borderRadius: "50%",
              border: "2px solid rgba(0,0,0,0.3)",
              borderTopColor: "#000",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
          )}
          {status === "loading" ? "Sending…" : "Get free picks"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      {/* Legal + error */}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#444" }}>
          No spam. Unsubscribe any time.
        </span>
        {status === "error" && (
          <span style={{ fontSize: 11, color: "#ef4444" }}>{errorMsg}</span>
        )}
      </div>
    </div>
  );
}
