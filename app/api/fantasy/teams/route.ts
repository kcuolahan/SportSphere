import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { leagueId, teamName, userEmail } = await request.json()
  return NextResponse.json({
    team: {
      id: crypto.randomUUID(),
      leagueId,
      teamName,
      userEmail,
      totalXp: 0,
      rank: 0,
    }
  })
}
