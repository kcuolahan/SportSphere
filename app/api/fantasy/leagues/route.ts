import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ leagues: [] })
}

export async function POST(request: Request) {
  const { name, sports, maxTeams, draftDate } = await request.json()
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  return NextResponse.json({
    league: {
      id: crypto.randomUUID(),
      name,
      sports: sports || ['AFL'],
      maxTeams: maxTeams || 12,
      draftDate: draftDate || null,
      inviteCode,
      status: 'setup',
    }
  })
}
