'use client'

import Link from 'next/link'

export default function NFLPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mb-12">
          <div className="text-6xl font-bold mb-4">🏈</div>
          <h1 className="text-4xl font-bold mb-4">NFL Coming Soon</h1>
          <p className="text-xl text-[#888] mb-8">
            Receiving yards. Rushing yards. TD predictions. Same methodology.
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 mb-8">
          <p className="text-[#888] mb-4">Expected launch: Late 2026</p>
          <p className="text-sm text-[#666]">
            NFL player prop modeling launching after NBA.
            Both available to Pro members at no extra cost.
          </p>
        </div>

        <Link
          href="/predictions"
          className="inline-block bg-[#f97316] hover:bg-[#ea580c] rounded font-bold py-3 px-8"
        >
          Back to AFL
        </Link>
      </div>
    </div>
  )
}
