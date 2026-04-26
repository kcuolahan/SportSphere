'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeedPicksPage() {
  const [file, setFile] = useState<File | null>(null)
  const [round, setRound] = useState('7')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
      
      setTimeout(() => {
        router.push('/predictions')
      }, 2000)
      
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
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
              Must contain "Enhanced Picks" sheet with HC picks
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
              <p className="text-green-500/70 text-xs mt-2">
                Redirecting to predictions page...
              </p>
              
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
      </div>
    </div>
  )
}
