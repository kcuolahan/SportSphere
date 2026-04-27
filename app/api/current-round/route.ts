import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('status', 'active')
    .eq('sport', 'AFL')
    .single()

  if (error || !data) {
    return NextResponse.json({ round: 8, season: 2026 })
  }

  return NextResponse.json({
    round: data.round_number,
    season: data.season,
    sport: data.sport,
    status: data.status,
    picksSeededAt: data.picks_seeded_at,
  })
}

export async function POST(request: Request) {
  const { roundNumber } = await request.json()

  // Mark previous active round as completed
  await supabase
    .from('rounds')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('status', 'active')
    .eq('sport', 'AFL')

  // Upsert the new active round
  const { data, error } = await supabase
    .from('rounds')
    .upsert(
      {
        round_number: roundNumber,
        season: 2026,
        sport: 'AFL',
        status: 'active',
        picks_seeded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'round_number' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, round: data })
}
