import { Skeleton } from "@/components/ui/Skeleton";

export default function DefenceLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 60, background: "#080808", borderBottom: "1px solid #111" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "84px 20px 60px" }}>
        <div style={{ marginBottom: 32 }}>
          <Skeleton width={140} height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="25%" height={36} style={{ marginBottom: 12 }} />
          <Skeleton width="75%" height={52} borderRadius={8} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[50, 50, 50, 50, 55].map((w, i) => <Skeleton key={i} width={w} height={32} borderRadius={6} />)}
        </div>
        <div style={{ border: "1px solid #111", borderRadius: 12, overflow: "hidden" }}>
          {Array.from({ length: 19 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "13px 14px", borderBottom: "1px solid #0a0a0a", background: i === 0 ? "#080808" : i % 2 === 0 ? "#050505" : "#000" }}>
              <Skeleton width="18%" height={12} style={{ animationDelay: `${i * 0.04}s` }} />
              {[1, 2, 3, 4, 5].map(j => <Skeleton key={j} width="13%" height={12} style={{ animationDelay: `${(i + j) * 0.03}s` }} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
