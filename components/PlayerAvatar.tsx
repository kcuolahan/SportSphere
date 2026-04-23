import { getPlayerInitials } from '@/lib/teams'

const TEAM_BG: Record<string, string> = {
  COL: '#000000', GEE: '#002B5C', SYD: '#E2211C', PTA: '#008AAB',
  CAR: '#0E1E4B', MEL: '#CC2031', RIC: '#FFD200', ESS: '#CC0000',
  HAW: '#4D2004', WBD: '#0057A8', FRE: '#2E0040', GWS: '#F15C22',
  BRL: '#A30046', ADE: '#002B5C', GCS: '#E87722', WCE: '#002B5C',
  STK: '#ED1B2F', NME: '#003B99', NTH: '#003B99',
}

interface PlayerAvatarProps {
  name: string
  team: string
  size?: number
}

export function PlayerAvatar({ name, team, size = 36 }: PlayerAvatarProps) {
  const bg = TEAM_BG[team] ?? '#1a1a1a'
  const initials = getPlayerInitials(name)
  const textColor = team === 'RIC' ? '#000000' : '#ffffff'

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.round(size * 0.33),
      fontWeight: 800,
      color: textColor,
      flexShrink: 0,
      letterSpacing: '-0.02em',
      userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}
