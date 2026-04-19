export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: '#f97316',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#000',
        }}>S</div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>
          Sport<span style={{ color: '#f97316' }}>Sphere</span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 14,
            background: '#111',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
            width: i === 3 ? '60%' : '100%',
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
