import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";

export default function PlayerProfileLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 60, background: "#080808", borderBottom: "1px solid #111" }} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
          <Skeleton width={40} height={10} />
          <Skeleton width={8} height={10} />
          <Skeleton width={55} height={10} />
          <Skeleton width={8} height={10} />
          <Skeleton width={100} height={10} />
        </div>

        {/* Hero */}
        <div style={{ background: "#080808", border: "1px solid #111", borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <SkeletonCircle size={96} />
            <div style={{ flex: 1 }}>
              <Skeleton width="50%" height={28} style={{ marginBottom: 12 }} />
              <Skeleton width="40%" height={12} style={{ marginBottom: 20 }} />
              <div style={{ display: "flex", gap: 24 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i}>
                    <Skeleton width={30} height={9} style={{ marginBottom: 6 }} />
                    <Skeleton width={36} height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #111", marginBottom: 20 }}>
          {[80, 65, 130, 45].map((w, i) => (
            <Skeleton key={i} width={w} height={34} borderRadius={0} style={{ marginBottom: -1 }} />
          ))}
        </div>

        {/* Tab content skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[1, 2].map(i => (
            <div key={i} style={{ background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 18 }}>
              <Skeleton width="50%" height={10} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={28} style={{ marginBottom: 12 }} />
              <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={14} />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1", background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 18 }}>
            <Skeleton width="30%" height={10} style={{ marginBottom: 16 }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid #0a0a0a" }}>
                <Skeleton width={40} height={12} />
                <Skeleton width={50} height={12} />
                <Skeleton width={50} height={12} />
                <Skeleton width={60} height={12} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
