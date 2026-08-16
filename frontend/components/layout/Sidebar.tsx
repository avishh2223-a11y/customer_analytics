'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingDown,
  BarChart3,
  Lightbulb,
  Target,
  FileText,
  Settings,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    href: '/predict-churn',
    label: 'Predict Churn',
    icon: TrendingDown,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    href: '/explainability',
    label: 'Explainability',
    icon: Lightbulb,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    href: '/recommendations',
    label: 'Recommendations',
    icon: Target,
    color: 'bg-green-100 text-green-600',
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600',
  },
]

const secondary = [
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    color: 'bg-gray-100 text-gray-600',
  },
  {
    href: '/about',
    label: 'About',
    icon: Info,
    color: 'bg-orange-100 text-orange-600',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    
    <aside className="w-72 h-screen bg-white/90 backdrop-blur-xl border-r border-pink-100 flex flex-col shadow-sm">

      <div className="px-7 py-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">
          ChurnAI
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customer Intelligence
        </p>
      </div>

      
      <nav className="flex-1 px-5 space-y-2 overflow-y-auto">

        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + '/')

          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300',
                active
                  ? 'bg-pink-50 shadow-sm'
                  : 'hover:bg-slate-50'
              )}
            >
              <div
                className={cn(
                  'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
                  item.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span
                className={cn(
                  'font-medium',
                  active
                    ? 'text-pink-600'
                    : 'text-slate-600'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        <div className="pt-6 border-t border-slate-100 mt-6 pb-4">
          {secondary.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
              >
                <div
                  className={cn(
                    'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
                    item.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="text-slate-600 font-medium">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

      </nav>

      
      <div className="p-6 mt-auto shrink-0">
        <div className="rounded-3xl bg-gradient-to-r from-pink-100 via-yellow-100 to-cyan-100 p-5">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="text-xs text-slate-500">
                Model Status
              </p>
              <p className="font-semibold text-slate-700">
                Healthy
              </p>
            </div>
          </div>
        </div>
      </div>

    </aside>
  )
}