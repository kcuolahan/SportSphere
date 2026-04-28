'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export interface ProAccess {
  isPro: boolean
  loading: boolean
  isLoggedIn: boolean
  userEmail: string | null
  recheckPro: () => Promise<void>
  signOut: () => Promise<void>
}

export function useProAccess(): ProAccess {
  const [isPro, setIsPro] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  async function checkStatus() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

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

      setIsLoggedIn(true)
      setUserEmail(session.user.email || null)

      const res = await fetch('/api/check-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })
      const data = await res.json()
      setIsPro(data.isPro === true)
      setLoading(false)
    } catch (e) {
      console.error('[auth] critical error:', e)
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('[auth] state change:', event)
      if (event === 'SIGNED_OUT') {
        setIsPro(false)
        setIsLoggedIn(false)
        setUserEmail(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkStatus()
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recheckPro = async () => {
    setLoading(true)
    await checkStatus()
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return { isPro, isLoggedIn, loading, userEmail, recheckPro, signOut }
}
