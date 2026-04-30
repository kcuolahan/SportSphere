import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const roundParam = searchParams.get('round') || '8'
  const tier = searchParams.get('tier')

  let query = supabase
    .from('live_picks')
    .select('*')
    .order('round', { ascending: false })
    .order('edge_vol', { ascending: false })

  if (roundParam !== 'ALL') {
    query = query.eq('round', parseInt(roundParam))
  }

  if (tier && tier !== 'ALL') {
    query = query.eq('tier', tier)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ picks: data || [], count: data?.length || 0 })
}
