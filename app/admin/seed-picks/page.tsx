'use client'

import { useState } from 'react'

export default function SeedPicksPage() {
  const [file, setFile] = useState<File | null>(null)
  const [round, setRound] = useState('8')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [alertSecret, setAlertSecret] = useState('')
  const [alertLoading, setAlertLoading] = useState(false)
  const [alertResult, setAlertResult] = useState<any>(null)
  const [alertError, setAlertError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('round', round)

      const response = await fetch('/api/upload-picks', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setResult(data)
      setFile(null)

      // Update active round in Supabase
      await fetch('/api/current-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundNumber: parseInt(round) }),
      })
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSendAlert = async () => {
    setAlertLoading(true)
    setAlertError(null)
    setAlertResult(null)

    try {
      const res = await fetch('/api/send-picks-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundNumber: parseInt(round), secret: alertSecret }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAlertError(data.error || 'Failed to send alert')
        return
      }

      setAlertResult(data)
    } catch (err) {
      setAlertError(String(err))
    } finally {
      setAlertLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">Seed Round Picks</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Round Number</label>
            <input
              type="number"
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white"
              min="1"
              max="24"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Excel File</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white"
            />
            <p className="text-xs text-[#666] mt-2">
              Must contain &quot;Enhanced Picks&quot; sheet with HC picks
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-500/10 border border-green-500 rounded p-4">
              <p className="text-green-500 text-sm font-semibold">✓ {result.message}</p>
              <p className="text-green-500/70 text-xs mt-1">Round {round} set as active in Supabase.</p>
              {result.picks && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-green-500">Seeded picks:</p>
                  {result.picks.map((pick: any, i: number) => (
                    <p key={i} className="text-xs text-green-500/70">
                      {pick.player_name} ({pick.team}) - {pick.prediction} {pick.line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 rounded font-bold py-3 px-4"
          >
            {loading ? 'Uploading...' : 'Seed HC Picks'}
          </button>
        </form>

        {result && (
          <div className="mt-8 border border-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-lg font-bold mb-1">Send Email Alert</h2>
            <p className="text-xs text-[#666] mb-4">Emails all Pro subscribers with Round {round} HC picks.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Admin Secret</label>
                <input
                  type="password"
                  value={alertSecret}
                  onChange={(e) => setAlertSecret(e.target.value)}
                  placeholder="Enter ADMIN_SECRET"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white"
                />
              </div>

              {alertError && (
                <div className="bg-red-500/10 border border-red-500 rounded p-3">
                  <p className="text-red-500 text-sm">{alertError}</p>
                </div>
              )}

              {alertResult && (
                <div className="bg-green-500/10 border border-green-500 rounded p-3">
                  <p className="text-green-500 text-sm font-semibold">
                    ✓ Sent to {alertResult.emailsSent} Pro subscriber{alertResult.emailsSent !== 1 ? 's' : ''} ({alertResult.pickCount} picks)
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendAlert}
                disabled={alertLoading || !alertSecret || !!alertResult}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 rounded font-bold py-3 px-4 text-black"
              >
                {alertLoading ? 'Sending...' : alertResult ? 'Alert Sent ✓' : `Send Round ${round} Alert`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
