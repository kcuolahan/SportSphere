interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1
  const fontSize = Math.round(18 * scale)
  const offset = Math.round(4 * scale)
  const containerSize = Math.round(28 * scale)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: containerSize, height: containerSize, flexShrink: 0 }}>
        <span style={{
          position: 'absolute', top: 0, left: 0,
          fontSize, fontWeight: 900, color: '#f97316',
          lineHeight: 1, letterSpacing: '-0.04em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          zIndex: 2,
        }}>S</span>
        <span style={{
          position: 'absolute', top: offset, left: offset,
          fontSize, fontWeight: 900, color: '#ffffff',
          lineHeight: 1, letterSpacing: '-0.04em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          zIndex: 1, opacity: 0.9,
        }}>S</span>
      </div>

      {showText && (
        <span style={{
          fontSize: Math.round(15 * scale),
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#f0f0f0',
          lineHeight: 1,
        }}>
          Sport<span style={{ color: '#f97316' }}>Sphere</span>
        </span>
      )}
    </div>
  )
}
