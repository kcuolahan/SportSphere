"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MOBILE_LINKS = [
  { href: "/predictions", label: "Picks", icon: "★" },
  { href: "/accuracy", label: "Results", icon: "✓" },
  { href: "/defence", label: "DvP", icon: "⚔" },
  { href: "/players", label: "Players", icon: "▤" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {MOBILE_LINKS.map(link => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, flex: 1,
              textDecoration: "none", padding: "6px 0",
              color: active ? "#f97316" : "#555",
              transition: "color 0.15s",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{link.icon}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {link.label}
            </span>
            {active && (
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316", marginTop: 1 }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
