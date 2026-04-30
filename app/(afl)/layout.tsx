import { AFLSidebar } from '@/components/AFLSidebar'

export default function AFLGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <AFLSidebar />
      {/* pt-14 on mobile pushes content below the floating hamburger button */}
      <main className="flex-1 min-w-0 overflow-x-hidden pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
