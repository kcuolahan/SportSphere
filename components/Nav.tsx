"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentPredictions } from "@/lib/data";
import { supabase, signOut } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const { round, season } = getCurrentPredictions();

const LINKS = [
  { href: "/predictions", label: "Picks" },
  { href: "/accuracy", label: "Track Record" },
  { href: "/insights", label: "Insights", isNew: true },
  { href: "/defence", label: "DvP" },
  { href: "/simulator", label: "Simulator", isNew: true },
  { href: "/players", label: "Players" },
  { href: "/tracker", label: "Tracker" },
  { href: "/model", label: "How It Works" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) { setUser(null); return; }
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #111",
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.svg" alt="SportSphere HQ" width={32} height={32} style={{ borderRadius: "50%" }} />
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "#f0f0f0", lineHeight: 1 }}>
              Sport<span style={{ color: "#f97316" }}>Sphere</span> HQ
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }} className="nav-desktop">
            {LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#f97316" : "#555",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  borderBottom: active ? "1px solid #f97316" : "1px solid transparent",
                  transition: "color 0.15s",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  {link.label}
                  {(link as { isNew?: boolean }).isNew && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, color: "#000",
                      background: "#f97316", borderRadius: 3,
                      padding: "1px 4px", letterSpacing: "0.04em",
                      lineHeight: 1.5,
                    }}>NEW</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="nav-desktop">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 11, color: "#777", letterSpacing: "0.04em" }}>
                Round {round} · {season}
              </span>
            </div>
            <Link href="/faq" style={{ fontSize: 12, color: "#666", textDecoration: "none" }} className="nav-desktop">
              FAQ
            </Link>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-desktop">
                <span style={{ fontSize: 11, color: "#555", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  style={{ fontSize: 11, color: "#555", background: "none", border: "1px solid #1f1f1f", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" style={{ fontSize: 12, fontWeight: 600, color: "#f97316", textDecoration: "none", border: "1px solid #f9731640", borderRadius: 6, padding: "5px 12px" }} className="nav-desktop">
                Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="nav-mobile"
              style={{
                background: "none",
                border: "1px solid #1f1f1f",
                borderRadius: 6,
                padding: "6px 8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
              aria-label="Open menu"
            >
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 18, height: 1.5, background: "#555", borderRadius: 1 }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: 240,
              background: "#080808",
              borderLeft: "1px solid #111",
              padding: "72px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 11, color: "#777" }}>Round {round} · {season}</span>
            </div>
            {LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 700 : 400,
                    color: active ? "#f97316" : "#888",
                    textDecoration: "none",
                    padding: "10px 0",
                    borderBottom: "1px solid #0a0a0a",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/faq"
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 14, color: "#555", textDecoration: "none", padding: "10px 0", marginTop: 8 }}
            >
              FAQ
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile { display: none !important; }
        @media (max-width: 700px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
