import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({
    league: {
      id: params.id,
      name: 'Demo League',
      sports: ['AFL'],
      status: 'active',
      inviteCode: 'ABC123',
      teams: [
        { id: '1', teamName: 'The Analysts', totalXp: 420, rank: 1 },
        { id: '2', teamName: 'Punt Runners', totalXp: 310, rank: 2 },
      ],
    }
  })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  return NextResponse.json({ league: { id: params.id, ...body } })
}
