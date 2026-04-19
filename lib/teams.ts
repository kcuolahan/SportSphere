export const TEAM_COLOURS: Record<string, { primary: string; secondary: string; name: string }> = {
  ADE: { primary: '#002B5C', secondary: '#E21937', name: 'Adelaide' },
  BRL: { primary: '#A30046', secondary: '#FBBF15', name: 'Brisbane Lions' },
  CAR: { primary: '#0E1E2D', secondary: '#0087CD', name: 'Carlton' },
  COL: { primary: '#1A1A1A', secondary: '#FFFFFF', name: 'Collingwood' },
  ESS: { primary: '#CC2031', secondary: '#000000', name: 'Essendon' },
  FRE: { primary: '#2A1A54', secondary: '#FFFFFF', name: 'Fremantle' },
  GCS: { primary: '#E2242A', secondary: '#FFD200', name: 'Gold Coast' },
  GEE: { primary: '#1C3C63', secondary: '#FFFFFF', name: 'Geelong' },
  GWS: { primary: '#F15C22', secondary: '#4C4C4C', name: 'GWS Giants' },
  HAW: { primary: '#4D2004', secondary: '#FBB81C', name: 'Hawthorn' },
  MEL: { primary: '#0F1131', secondary: '#CC2031', name: 'Melbourne' },
  NTH: { primary: '#013B9F', secondary: '#FFFFFF', name: 'North Melbourne' },
  PTA: { primary: '#008AAB', secondary: '#000000', name: 'Port Adelaide' },
  RIC: { primary: '#3B2F00', secondary: '#FFD200', name: 'Richmond' },
  STK: { primary: '#ED1C24', secondary: '#000000', name: 'St Kilda' },
  SYD: { primary: '#ED171F', secondary: '#FFFFFF', name: 'Sydney' },
  WBD: { primary: '#0039A6', secondary: '#FFFFFF', name: 'Western Bulldogs' },
  WCE: { primary: '#062E84', secondary: '#F2A800', name: 'West Coast' },
}

export function getTeamColour(teamCode: string): string {
  return TEAM_COLOURS[teamCode]?.primary || '#1a1a1a'
}

export function getTeamName(teamCode: string): string {
  return TEAM_COLOURS[teamCode]?.name || teamCode
}

export function getPlayerInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}
