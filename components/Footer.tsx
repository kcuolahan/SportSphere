import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #111",
      padding: "32px 24px",
      background: "#000",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Top row */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 24,
        }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <img src="/logo.svg" alt="SportSphere HQ" width={32} height={32} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", color: "#f0f0f0" }}>
                Sport<span style={{ color: "#f97316" }}>Sphere</span> HQ
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#555", margin: 0, maxWidth: 200, lineHeight: 1.7 }}>
              AFL disposal analytics. Not financial advice.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Platform</div>
              {[
                { href: "/predictions", label: "Picks" },
                { href: "/accuracy", label: "Track Record" },
                { href: "/defence", label: "DvP Rankings" },
                { href: "/players", label: "Player Explorer" },
                { href: "/tracker", label: "Tracker" },
                { href: "/insights", label: "Model Insights" },
              ].map(l => (
                <div key={l.href} style={{ marginBottom: 6 }}>
                  <Link href={l.href} style={{ fontSize: 12, color: "#666", textDecoration: "none" }}>{l.label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Info</div>
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "/model", label: "How It Works" },
                { href: "/faq", label: "FAQ" },
                { href: "/about", label: "About" },
                { href: "/responsible-gambling", label: "Responsible Gambling" },
              ].map(l => (
                <div key={l.href} style={{ marginBottom: 6 }}>
                  <Link href={l.href} style={{ fontSize: 12, color: "#666", textDecoration: "none" }}>{l.label}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Responsible gambling */}
        <div style={{
          background: "#080808",
          border: "1px solid #111",
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div style={{
            background: "#f97316",
            color: "#000",
            fontSize: 9,
            fontWeight: 800,
            padding: "3px 7px",
            borderRadius: 4,
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}>18+</div>
          <span style={{ fontSize: 11, color: "#666", flex: 1 }}>
            Gamble responsibly. Call{" "}
            <a href="tel:1800858858" style={{ color: "#777", textDecoration: "none", fontWeight: 600 }}>
              1800 858 858
            </a>{" "}
            (National Gambling Helpline) or visit{" "}
            <a
              href="https://www.gamblinghelponline.org.au"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#777", textDecoration: "none", fontWeight: 600 }}
            >
              gamblinghelponline.org.au
            </a>
          </span>
          <Link href="/responsible-gambling" style={{ fontSize: 11, color: "#555", textDecoration: "none", flexShrink: 0 }}>
            Responsible Gambling →
          </Link>
        </div>

        {/* Bottom */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <p style={{ fontSize: 10, color: "#555", margin: 0 }}>
            © 2026 SportSphere HQ. Analytics only - not financial or betting advice.
          </p>
          <p style={{ fontSize: 10, color: "#555", margin: 0 }}>
            Not affiliated with any bookmaker.{" "}
            Questions?{" "}
            <a href="mailto:support@sportspherehq.com" style={{ color: "#666", textDecoration: "none" }}>
              support@sportspherehq.com
            </a>
            {/* Note: this inbox requires Google Workspace or Zoho Mail configured for sportspherehq.com */}
          </p>
        </div>

      </div>
    </footer>
  );
}
