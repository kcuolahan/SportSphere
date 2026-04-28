import { AFLSidebar } from '@/components/AFLSidebar'

export default function AFLLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AFLSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
