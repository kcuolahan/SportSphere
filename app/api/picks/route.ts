import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const round = parseInt(searchParams.get('round') || '8')
  const tier = searchParams.get('tier') || 'HC'

  const { data, error } = await supabase
    .from('live_picks')
    .select('*')
    .eq('round', round)
    .eq('tier', tier)
    .order('edge_vol', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ picks: data || [], count: data?.length || 0 })
}
