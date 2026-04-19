import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton";

export default function PredictionsLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 60, background: "#080808", borderBottom: "1px solid #111" }} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>

        {/* Header skeleton */}
        <div style={{ marginBottom: 32 }}>
          <Skeleton width={100} height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="40%" height={36} style={{ marginBottom: 10 }} />
          <Skeleton width="60%" height={14} />
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, background: "#080808", border: "1px solid #111", borderRadius: 10, padding: 16 }}>
              <Skeleton width="50%" height={10} style={{ marginBottom: 10 }} />
              <Skeleton width="70%" height={28} />
            </div>
          ))}
        </div>

        {/* Pick cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} height={90} />
          ))}
        </div>
      </div>
    </div>
  );
}
