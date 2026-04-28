import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton";

export default function PlayersLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 60, background: "#080808", borderBottom: "1px solid #111" }} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "84px 20px 60px" }}>
        <div style={{ marginBottom: 28 }}>
          <Skeleton width={80} height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="30%" height={36} style={{ marginBottom: 10 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <Skeleton width="100%" height={36} borderRadius={8} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[60, 50, 50, 50, 60, 50, 50].map((w, i) => (
            <Skeleton key={i} width={w} height={28} borderRadius={5} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} height={72} />
          ))}
        </div>
      </div>
    </div>
  );
}
