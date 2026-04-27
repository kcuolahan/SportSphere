'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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

  const checkProStatus = useCallback(async () => {
    const supabase = getSupabase()

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setIsLoggedIn(false)
        setIsPro(false)
        setLoading(false)
        return
      }

      const user = session.user
      setIsLoggedIn(true)
      setUserEmail(user.email || null)

      console.log('Checking pro status for:', user.email, 'id:', user.id)

      // METHOD 1: Check by email (webhook uses email as conflict key)
      if (user.email) {
        const { data: profileByEmail, error: emailError } = await supabase
          .from('user_profiles')
          .select('is_pro, pro_until, email')
          .eq('email', user.email)
          .maybeSingle()

        console.log('Profile by email:', profileByEmail, 'error:', emailError)

        if (profileByEmail) {
          const proStatus = profileByEmail.is_pro === true
          console.log('Pro status from email lookup:', proStatus)
          setIsPro(proStatus)
          setLoading(false)
          return
        }
      }

      // METHOD 2: Check by user ID
      const { data: profileById, error: idError } = await supabase
        .from('user_profiles')
        .select('is_pro, pro_until')
        .eq('id', user.id)
        .maybeSingle()

      console.log('Profile by ID:', profileById, 'error:', idError)

      if (profileById) {
        setIsPro(profileById.is_pro === true)
        setLoading(false)
        return
      }

      // No profile found
      console.log('No user_profiles row found for this user')
      setIsPro(false)
      setLoading(false)
    } catch (err) {
      console.error('useProAccess error:', err)
      setIsPro(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabase()

    checkProStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        checkProStatus()
      }
    )

    // Poll for 30s after mount to catch webhook delays
    let pollCount = 0
    const poll = setInterval(() => {
      pollCount++
      checkProStatus()
      if (pollCount >= 6) clearInterval(poll)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearInterval(poll)
    }
  }, [checkProStatus])

  return { isPro, isLoggedIn, loading, userEmail, recheckPro: checkProStatus }
}
