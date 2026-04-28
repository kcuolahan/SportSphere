import { AFLSidebar } from '@/components/AFLSidebar'

export default function AFLGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <AFLSidebar />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
