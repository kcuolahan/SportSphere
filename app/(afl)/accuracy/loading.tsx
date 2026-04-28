import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";

export default function AccuracyLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 60, background: "#080808", borderBottom: "1px solid #111" }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "84px 20px 60px" }}>

        <div style={{ marginBottom: 28 }}>
          <Skeleton width={120} height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="30%" height={38} style={{ marginBottom: 10 }} />
          <Skeleton width="55%" height={14} />
        </div>

        {/* Season headline stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: "#080808", padding: "20px 24px" }}>
              <Skeleton width="45%" height={10} style={{ marginBottom: 12 }} />
              <Skeleton width="60%" height={32} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={10} />
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, height: 140, marginBottom: 24 }}>
          <Skeleton width="100%" height="100%" borderRadius={12} />
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[80, 60, 60, 60, 60].map((w, i) => (
            <Skeleton key={i} width={w} height={28} borderRadius={5} />
          ))}
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} style={{ flex: 1, padding: "14px 16px", borderRight: "1px solid #111" }}>
              <Skeleton width="50%" height={9} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={15} />
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "9px 16px", borderBottom: "1px solid #111", background: "#050505" }}>
            <Skeleton width="100%" height={12} />
          </div>
          {Array.from({ length: 20 }).map((_, i) => (
            <SkeletonRow key={i} cols={12} />
          ))}
        </div>
      </div>
    </div>
  );
}
