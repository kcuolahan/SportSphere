'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

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

  const checkStatus = useCallback(async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setIsLoggedIn(false)
        setIsPro(false)
        setUserEmail(null)
        setLoading(false)
        return
      }

      setIsLoggedIn(true)
      setUserEmail(session.user.email || null)

      // Check by email first (webhook uses email as conflict key)
      const { data } = await supabase
        .from('user_profiles')
        .select('is_pro')
        .eq('email', session.user.email!)
        .maybeSingle()

      if (data) {
        setIsPro(data.is_pro === true)
        setLoading(false)
        return
      }

      // Fallback: check by user ID
      const { data: byId } = await supabase
        .from('user_profiles')
        .select('is_pro')
        .eq('id', session.user.id)
        .maybeSingle()

      setIsPro(byId?.is_pro === true)
    } catch (e) {
      console.error('Auth error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkStatus()
        }
        if (event === 'SIGNED_OUT') {
          setIsPro(false)
          setIsLoggedIn(false)
          setUserEmail(null)
          setLoading(false)
        }
      })

    return () => subscription.unsubscribe()
  }, [checkStatus])

  return { isPro, isLoggedIn, loading, userEmail, recheckPro: checkStatus }
}
