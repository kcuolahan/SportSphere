'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 20,
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0', margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 13, color: '#555', margin: 0, maxWidth: 360 }}>
        There was a problem loading this page. Please try refreshing.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#f97316', color: '#000',
          border: 'none', borderRadius: 8,
          padding: '10px 24px', fontSize: 13,
          fontWeight: 700, cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
