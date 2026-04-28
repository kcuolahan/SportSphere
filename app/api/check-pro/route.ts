import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ isPro: false })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data, error } = await admin
      .from('user_profiles')
      .select('is_pro, pro_until')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('[check-pro] error:', error)
      return NextResponse.json({ isPro: false })
    }

    const isPro = data?.is_pro === true && new Date(data?.pro_until) > new Date()
    return NextResponse.json({ isPro, proUntil: data?.pro_until ?? null })
  } catch (e) {
    console.error('[check-pro] exception:', e)
    return NextResponse.json({ isPro: false })
  }
}
