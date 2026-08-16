'use client'

import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-sky-50 to-yellow-50 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* Decorative Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-yellow-200/20 blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Added min-h-0 here */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden min-h-0">

        {/* Top Navigation */}
        <Topbar />

        {/* Scrollable Content - Added min-h-0 and relative here */}
        <main className="flex-1 overflow-y-auto min-h-0 relative scroll-smooth">

          <div className="mx-auto w-full max-w-7xl px-8 py-8 lg:px-10 lg:py-10">

            {children}

          </div>

        </main>

      </div>
    </div>
  )
}