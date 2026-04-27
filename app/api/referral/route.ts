import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateCode(email: string): string {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 8)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

// GET /api/referral?email=... — get or create referral code for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('referral_code, referral_count')
    .eq('email', email)
    .single()

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (profile.referral_code) {
    return NextResponse.json({ code: profile.referral_code, count: profile.referral_count ?? 0 })
  }

  const code = generateCode(email)
  await supabase.from('user_profiles').update({ referral_code: code }).eq('email', email)
  return NextResponse.json({ code, count: 0 })
}

// POST /api/referral — record a referral click or conversion
export async function POST(request: Request) {
  const { code, action } = await request.json()
  if (!code || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const { data: referrer } = await supabase
    .from('user_profiles')
    .select('email, referral_count')
    .eq('referral_code', code)
    .single()

  if (!referrer) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  if (action === 'convert') {
    await supabase
      .from('user_profiles')
      .update({ referral_count: (referrer.referral_count ?? 0) + 1 })
      .eq('email', referrer.email)
  }

  return NextResponse.json({ success: true, referrer: referrer.email })
}
