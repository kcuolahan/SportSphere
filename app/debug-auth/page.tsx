'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useProAccess } from '@/lib/auth'

export default function DebugPage() {
  const { isPro, isLoggedIn, loading, userEmail } = useProAccess()
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [checkProResult, setCheckProResult] = useState<Record<string, unknown> | null>(null)
  const [checkProError, setCheckProError] = useState<string | null>(null)

  useEffect(() => {
    async function debug() {
      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(!!session)
      setSessionEmail(session?.user?.email ?? null)

      if (session?.user?.email) {
        try {
          const res = await fetch('/api/check-pro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          })
          const data = await res.json()
          setCheckProResult(data)
        } catch (e) {
          setCheckProError(String(e))
        }
      }
    }
    debug()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono text-sm">
      <h1 className="text-2xl font-black mb-2 text-[#f97316]">Auth Debug</h1>
      <p className="text-[#555] text-xs mb-8">Diagnose Pro access issues in 30 seconds.</p>

      <div className="space-y-4 max-w-2xl">

        <Section title="1. Session present?" color={hasSession ? 'text-[#4ade80]' : 'text-red-400'}>
          <pre>{JSON.stringify({ hasSession, sessionEmail }, null, 2)}</pre>
          {hasSession === false && (
            <div className="mt-2 text-red-400 font-bold">No session — user is not logged in.</div>
          )}
        </Section>

        <Section title="2. Email in session" color="text-[#f97316]">
          <pre>{sessionEmail ?? 'null — not logged in'}</pre>
        </Section>

        <Section title="3. /api/check-pro result" color={checkProResult?.isPro ? 'text-[#4ade80]' : 'text-red-400'}>
          <pre>{checkProResult ? JSON.stringify(checkProResult, null, 2) : 'waiting...'}</pre>
          {checkProError && <div className="mt-2 text-red-400">Error: {checkProError}</div>}
          {checkProResult && !checkProResult.isPro && (
            <div className="mt-2 text-red-400 font-bold">
              isPro = false — either is_pro is not true in DB, or pro_until has expired,
              or no row found for this email.
            </div>
          )}
        </Section>

        <Section title="4. useProAccess hook state" color={isPro ? 'text-[#4ade80]' : 'text-[#888]'}>
          <pre>{JSON.stringify({ isPro, isLoggedIn, loading, userEmail }, null, 2)}</pre>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
      <h2 className={`font-bold mb-3 ${color}`}>{title}</h2>
      <div className="text-[#888]">{children}</div>
    </div>
  )
}
