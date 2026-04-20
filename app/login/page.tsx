"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { signIn, resetPassword } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push("/predictions");
  }

  async function handleForgot() {
    if (!email) { setError("Enter your email address first."); return; }
    setError(null);
    await resetPassword(email);
    setResetSent(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "120px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
            SportSphere HQ
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
            Sign in to your account to access saved picks and tracker.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "#100303", border: "1px solid #450a0a", borderRadius: 8, fontSize: 12, color: "#f87171" }}>
              {error}
            </div>
          )}
          {resetSent && (
            <div style={{ padding: "10px 14px", background: "#030f08", border: "1px solid #14532d", borderRadius: 8, fontSize: 12, color: "#4ade80" }}>
              Password reset email sent — check your inbox.
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, fontSize: 14, color: "#f0f0f0", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
              <button type="button" onClick={handleForgot} style={{ fontSize: 11, color: "#555", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Forgot password?
              </button>
            </div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password" required
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, fontSize: 14, color: "#f0f0f0", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", marginTop: 4,
            background: loading ? "#444" : "#f97316",
            border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 700, color: "#000",
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>

          <div style={{ textAlign: "center", fontSize: 12, color: "#555", marginTop: 4 }}>
            No account yet?{" "}
            <Link href="/signup" style={{ color: "#f97316", textDecoration: "none" }}>Create one free</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
