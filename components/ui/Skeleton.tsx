const ANIM = `
  @keyframes skPulse {
    0%, 100% { opacity: 0.30; }
    50%       { opacity: 0.65; }
  }
`;

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 14, borderRadius = 4, style }: SkeletonProps) {
  return (
    <>
      <style>{ANIM}</style>
      <div style={{
        width, height, borderRadius,
        background: "#111",
        animation: "skPulse 1.6s ease-in-out infinite",
        flexShrink: 0,
        ...style,
      }} />
    </>
  );
}

/** A circle skeleton, for avatars */
export function SkeletonCircle({ size = 36 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius="50%" />;
}

/** A full card-shaped skeleton block */
export function SkeletonCard({ height = 80 }: { height?: number }) {
  return (
    <div style={{
      background: "#080808", border: "1px solid #111",
      borderRadius: 10, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      height,
    }}>
      <style>{ANIM}</style>
      <SkeletonCircle size={40} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="55%" height={13} />
        <Skeleton width="35%" height={10} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        <Skeleton width={60} height={13} />
        <Skeleton width={40} height={10} />
      </div>
    </div>
  );
}

/** A table-row skeleton */
export function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "11px 16px", borderBottom: "1px solid #0a0a0a", alignItems: "center" }}>
      <style>{ANIM}</style>
      <SkeletonCircle size={28} />
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? "20%" : "9%"} height={12} style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  );
}
