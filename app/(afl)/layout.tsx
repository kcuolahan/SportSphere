'use client'

import { AFLSidebar } from '@/components/AFLSidebar'
import { useProAccess } from '@/lib/auth'

export default function AFLGroupLayout({ children }: { children: React.ReactNode }) {
  const { isPro, loading } = useProAccess()

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      {!loading && isPro && (
        <div className="bg-[#4ade80]/5 border-b border-[#4ade80]/20 px-6 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-[#4ade80] rounded-full inline-block" />
            <span className="text-[#4ade80] font-semibold">Pro active</span>
            <span className="text-[#666]">— full access enabled</span>
          </div>
        </div>
      )}
      <div className="flex flex-1">
        <AFLSidebar />
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
