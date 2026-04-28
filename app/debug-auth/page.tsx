'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useProAccess } from '@/lib/auth'

export default function DebugPage() {
  const { isPro, isLoggedIn, loading, userEmail } = useProAccess()
  const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null)
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [allProfiles, setAllProfiles] = useState<Record<string, unknown>[] | null>(null)

  useEffect(() => {
    async function debug() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session }, error: sErr } = await supabase.auth.getSession()
      setSessionData({
        hasSession: !!session,
        email: session?.user?.email ?? null,
        id: session?.user?.id ?? null,
        sessionError: sErr?.message ?? null,
      })

      if (session?.user?.email) {
        // Query by email
        const { data: byEmail, error: pErr } = await supabase
          .from('user_profiles')
          .select('id, email, is_pro, pro_until')
          .eq('email', session.user.email)
          .maybeSingle()

        setProfileData(byEmail as Record<string, unknown> | null)
        setQueryError(pErr?.message ?? null)

        // Also try fetching all visible rows (RLS check)
        const { data: all } = await supabase
          .from('user_profiles')
          .select('id, email, is_pro')
          .limit(5)

        setAllProfiles(all as Record<string, unknown>[] | null)
      }
    }
    debug()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono text-sm">
      <h1 className="text-2xl font-black mb-8 text-[#f97316]">Auth Debug</h1>

      <div className="space-y-6 max-w-2xl">
        <Section title="useProAccess hook" color="text-[#4ade80]">
          <pre>{JSON.stringify({ isPro, isLoggedIn, loading, userEmail }, null, 2)}</pre>
        </Section>

        <Section title="Raw Supabase Session" color="text-[#f97316]">
          <pre>{JSON.stringify(sessionData, null, 2)}</pre>
        </Section>

        <Section title="user_profiles row (by email)" color="text-[#f97316]">
          <pre>{JSON.stringify(profileData, null, 2)}</pre>
          {queryError && (
            <div className="mt-3 text-red-400 font-bold">
              RLS/Query Error: {queryError}
            </div>
          )}
        </Section>

        <Section title="All visible rows (RLS test, max 5)" color="text-[#888]">
          <pre>{JSON.stringify(allProfiles, null, 2)}</pre>
          {allProfiles?.length === 0 && (
            <div className="mt-2 text-red-400 font-bold">
              ⚠ No rows visible — RLS is blocking reads. Run supabase/fix-rls.sql
            </div>
          )}
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
