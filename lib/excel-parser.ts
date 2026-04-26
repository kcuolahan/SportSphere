import * as XLSX from 'xlsx'

export interface ParsedPick {
  round: number
  playerName: string
  pos: string
  team: string
  opponent: string
  venue: string
  line: number
  edge: number
  direction: string
  betScore: number
  signal: string
}

function parseBuffer(buffer: ArrayBuffer, round: number): ParsedPick[] {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const worksheet = workbook.Sheets['Enhanced Picks']

  if (!worksheet) {
    throw new Error('Enhanced Picks sheet not found in workbook')
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 0 }) as Record<string, unknown>[]

  return rows
    .filter((row) => String(row['Signal'] ?? '').includes('HIGH CONVICTION'))
    .map((row) => ({
      round,
      playerName: String(row['Player'] ?? ''),
      pos: String(row['Pos'] ?? ''),
      team: String(row['Team'] ?? ''),
      opponent: String(row['Opponent'] ?? ''),
      venue: String(row['Venue'] ?? ''),
      line: parseFloat(String(row['Line'] ?? '0')),
      edge: parseFloat(String(row['Edge'] ?? '0')),
      direction: String(row['Direction'] ?? ''),
      betScore: parseFloat(String(row['Bet Score'] ?? '0')),
      signal: String(row['Signal'] ?? ''),
    }))
}

// Works in both browser (File.arrayBuffer()) and Node.js (web API)
export async function parseEnhancedPicksFromFile(file: File, round: number): Promise<ParsedPick[]> {
  const buffer = await file.arrayBuffer()
  return parseBuffer(buffer, round)
}

export function extractPrediction(direction: string): 'OVER' | 'UNDER' {
  return direction.toUpperCase().includes('OVER') ? 'OVER' : 'UNDER'
}

export function extractEdgeVol(betScore: number): number {
  return betScore
}
