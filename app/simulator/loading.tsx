import { Skeleton } from "@/components/ui/Skeleton";

export default function SimulatorLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 60, background: "#080808", borderBottom: "1px solid #111" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 20px 60px" }}>

        <div style={{ marginBottom: 28 }}>
          <Skeleton width={100} height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="45%" height={36} style={{ marginBottom: 10 }} />
          <Skeleton width="65%" height={13} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
          {/* Left panel */}
          <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, padding: 18 }}>
            <Skeleton width="60%" height={10} style={{ marginBottom: 20 }} />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Skeleton width="50%" height={10} />
                  <Skeleton width={32} height={10} />
                </div>
                <Skeleton width="100%" height={4} borderRadius={2} />
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div>
            {/* Comparison table */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #111" }}>
                <Skeleton width="100%" height={10} />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "10px 12px", borderBottom: "1px solid #0a0a0a" }}>
                  <Skeleton width="40%" height={12} />
                  <Skeleton width="15%" height={12} style={{ marginLeft: "auto" }} />
                  <Skeleton width="15%" height={12} />
                  <Skeleton width="12%" height={12} />
                </div>
              ))}
            </div>

            {/* Insight */}
            <div style={{ background: "#0a0800", border: "1px solid #f9731620", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
              <Skeleton width="90%" height={12} style={{ marginBottom: 6 }} />
              <Skeleton width="70%" height={12} />
            </div>

            {/* Position breakdown */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #111" }}>
                <Skeleton width="30%" height={10} />
              </div>
              {["MID", "DEF", "FWD", "RUCK"].map(pos => (
                <div key={pos} style={{ display: "flex", gap: 16, padding: "9px 14px", borderBottom: "1px solid #0a0a0a" }}>
                  <Skeleton width={40} height={20} borderRadius={4} />
                  <Skeleton width={40} height={12} />
                  <Skeleton width={50} height={12} />
                  <Skeleton width={60} height={12} />
                  <Skeleton width={45} height={12} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
