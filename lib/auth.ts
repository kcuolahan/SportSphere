'use client'
import { useState, useEffect } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton client — created once, session persists across renders
let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'supabase-auth',
        },
      }
    )
  }
  return _supabase
}

export interface ProAccess {
  isPro: boolean
  loading: boolean
  isLoggedIn: boolean
  userEmail: string | null
  recheckPro: () => Promise<void>
}

export function useProAccess(): ProAccess {
  const [isPro, setIsPro] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  async function check() {
    const supabase = getSupabase()
    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) {
        console.error('[auth] session error:', sessionError.message)
        setLoading(false)
        return
      }

      if (!session?.user) {
        setIsLoggedIn(false)
        setIsPro(false)
        setLoading(false)
        return
      }

      const user = session.user
      setIsLoggedIn(true)
      setUserEmail(user.email || null)

      // Query by email first — webhook inserts use email as conflict key
      const { data: byEmail, error: emailErr } = await supabase
        .from('user_profiles')
        .select('is_pro, pro_until, email, id')
        .eq('email', user.email!)
        .maybeSingle()

      console.log('[auth] byEmail:', byEmail, emailErr?.message)

      if (byEmail != null) {
        setIsPro(byEmail.is_pro === true)
        setLoading(false)
        return
      }

      // Fallback: query by auth UUID
      const { data: byId, error: idErr } = await supabase
        .from('user_profiles')
        .select('is_pro, pro_until')
        .eq('id', user.id)
        .maybeSingle()

      console.log('[auth] byId:', byId, idErr?.message)

      setIsPro(byId?.is_pro === true)
      setLoading(false)
    } catch (e) {
      console.error('[auth] critical error:', e)
      setLoading(false)
    }
  }

  useEffect(() => {
    const supabase = getSupabase()

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[auth] state change:', event)
        if (event === 'SIGNED_OUT') {
          setIsPro(false)
          setIsLoggedIn(false)
          setUserEmail(null)
          setLoading(false)
        } else if (session) {
          check()
        }
      }
    )

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recheckPro = async () => {
    setLoading(true)
    await check()
  }

  return { isPro, isLoggedIn, loading, userEmail, recheckPro }
}
