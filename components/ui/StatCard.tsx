interface StatCardProps {
  value: string | number;
  label: string;
  sub?: string;
  color?: string;
}

export default function StatCard({ value, label, sub, color = "#f97316" }: StatCardProps) {
  return (
    <div style={{
      background: "#0a0a0a",
      border: "1px solid #111",
      borderRadius: 10,
      padding: "16px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#f0f0f0", fontWeight: 600, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
