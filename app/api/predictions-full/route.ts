import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const round = parseInt(searchParams.get('round') || '8')
  const season = parseInt(searchParams.get('season') || '2026')

  const { data, error } = await supabase
    .from('predictions_full')
    .select('*')
    .eq('round', round)
    .eq('season', season)
    .order('edge_vol_score', { ascending: false })

  if (error) {
    // Table may not exist yet — return empty rather than 500
    console.warn('[predictions-full] query error:', error.message)
    return NextResponse.json(
      { predictions: [], count: 0 },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } },
    )
  }

  return NextResponse.json(
    { predictions: data || [], count: data?.length || 0 },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } },
  )
}
