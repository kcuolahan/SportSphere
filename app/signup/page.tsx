"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { signUp } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push("/predictions"), 2500);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "120px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
            Free Access
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            Create free account
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
            Save picks, track bets, and access the full model.
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "24px", background: "#030f08", border: "1px solid #14532d", borderRadius: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>✓ Account created!</div>
            <div style={{ fontSize: 12, color: "#555" }}>Check your email to confirm. Redirecting to picks...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div style={{ padding: "10px 14px", background: "#100303", border: "1px solid #450a0a", borderRadius: 8, fontSize: 12, color: "#f87171" }}>
                {error}
              </div>
            )}

            {[
              { label: "Email", type: "email", value: email, set: setEmail, placeholder: "you@example.com" },
              { label: "Password", type: "password", value: password, set: setPassword, placeholder: "Min. 8 characters" },
              { label: "Confirm Password", type: "password", value: confirm, set: setConfirm, placeholder: "Re-enter password" },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  required
                  style={{
                    width: "100%", padding: "12px 14px",
                    background: "#0a0a0a", border: "1px solid #1f1f1f",
                    borderRadius: 8, fontSize: 14, color: "#f0f0f0",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", marginTop: 4,
              background: loading ? "#444" : "#f97316",
              border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 700, color: "#000",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Creating account..." : "Create free account →"}
            </button>

            <div style={{ textAlign: "center", fontSize: 12, color: "#555", marginTop: 4 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#f97316", textDecoration: "none" }}>Sign in</Link>
            </div>
          </form>
        )}

        <p style={{ fontSize: 10, color: "#333", marginTop: 24, textAlign: "center", lineHeight: 1.7 }}>
          Free forever · No credit card · Analytics only - not betting advice
        </p>
      </div>
      <Footer />
    </div>
  );
}
