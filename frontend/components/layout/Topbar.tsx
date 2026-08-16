'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  Settings,
  User,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'

import { formatDistanceToNow } from 'date-fns'

export function Topbar() {
  const router = useRouter()

  const { user, logout } = useAuth()

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()

  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-700">

      <div className="flex h-20 items-center justify-between px-8">

        {/* Logo */}

        <Link
          href="/dashboard"
          className="flex items-center gap-4"
        >

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 shadow-lg">

            <Sparkles className="h-6 w-6 text-white" />

          </div>

          <div>

            <h1 className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-2xl font-bold text-transparent">
              ChurnAI
            </h1>

            <p className="text-xs text-slate-500">
              Customer Intelligence Platform
            </p>

          </div>

        </Link>

        {/* Search */}

        <Popover
          open={searchOpen}
          onOpenChange={setSearchOpen}
        >

          <PopoverTrigger asChild>

            <div className="mx-10 flex-1 max-w-xl">

              <div className="relative">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />

                <Input
                  readOnly
                  onClick={() => setSearchOpen(true)}
                  placeholder="Search customers, reports, predictions..."
                  className="
                    h-12
                    rounded-2xl
                    border-pink-100
                    bg-pink-50/70
                    pl-12
                    shadow-sm
                    placeholder:text-slate-400
                    focus-visible:ring-pink-300
                    dark:bg-slate-800
                    dark:border-slate-700
                  "
                />

              </div>

            </div>

          </PopoverTrigger>

          <PopoverContent
            className="
              w-[450px]
              rounded-3xl
              border-pink-100
              bg-white
              p-5
              shadow-xl
              dark:bg-slate-900
            "
          >

            <Input
              autoFocus
              placeholder="Start typing..."
              className="
                h-11
                rounded-xl
                border-pink-100
                bg-pink-50
              "
            />

            <div className="mt-6">

              <p className="mb-3 text-sm font-semibold text-slate-600">
                Recent Searches
              </p>

              <div className="space-y-2">

                <button className="flex w-full rounded-xl p-3 hover:bg-pink-50 transition">
                  Customer #12345
                </button>

                <button className="flex w-full rounded-xl p-3 hover:bg-cyan-50 transition">
                  Monthly Analytics Report
                </button>

                <button className="flex w-full rounded-xl p-3 hover:bg-yellow-50 transition">
                  High Risk Customers
                </button>

              </div>

            </div>

          </PopoverContent>

        </Popover>

        {/* Right Side */}

        <div className="flex items-center gap-3">
                  {/* Notifications */}

          <Popover>

            <PopoverTrigger asChild>

              <Button
                variant="ghost"
                size="icon"
                className="
                  relative
                  h-11
                  w-11
                  rounded-2xl
                  bg-pink-50
                  hover:bg-pink-100
                  dark:bg-slate-800
                "
              >

                <Bell className="h-5 w-5 text-pink-500" />

                {unreadCount > 0 && (

                  <Badge
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-pink-500
                      p-0
                      text-[10px]
                      text-white
                    "
                  >
                    {unreadCount}
                  </Badge>

                )}

              </Button>

            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="
                w-[380px]
                rounded-3xl
                border-pink-100
                bg-white
                p-0
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
              "
            >

              <div className="flex items-center justify-between border-b border-pink-100 p-5">

                <h3 className="font-semibold text-slate-700 dark:text-white">
                  Notifications
                </h3>

                {unreadCount > 0 && (

                  <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-pink-500 hover:text-pink-600"
                  >
                    Mark all read
                  </button>

                )}

              </div>

              <div className="max-h-96 overflow-y-auto">

                {notifications.length === 0 ? (

                  <div className="p-10 text-center text-slate-400">
                    No notifications
                  </div>

                ) : (

                  notifications.map((notif) => (

                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`
                        cursor-pointer
                        border-b
                        border-pink-50
                        p-4
                        transition
                        hover:bg-pink-50
                        ${
                          !notif.read
                            ? 'bg-pink-50/60'
                            : ''
                        }
                      `}
                    >

                      <div className="flex gap-3">

                        {!notif.read && (
                          <div className="mt-2 h-2 w-2 rounded-full bg-pink-500" />
                        )}

                        <div className="flex-1">

                          <p className="font-medium text-slate-700 dark:text-white">
                            {notif.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {notif.message}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {formatDistanceToNow(
                              notif.timestamp,
                              { addSuffix: true }
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  ))

                )}

              </div>

            </PopoverContent>

          </Popover>

          {/* Theme */}

          {mounted && (

            <Button
              variant="ghost"
              size="icon"
              className="
                h-11
                w-11
                rounded-2xl
                bg-cyan-50
                hover:bg-cyan-100
                dark:bg-slate-800
              "
              onClick={() =>
                setTheme(
                  theme === 'dark'
                    ? 'light'
                    : 'dark'
                )
              }
            >

              {theme === 'dark'
                ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )
                : (
                  <Moon className="h-5 w-5 text-cyan-500" />
                )}

            </Button>

          )}

          {/* User */}

          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <Button
                variant="ghost"
                className="rounded-2xl p-1 hover:bg-pink-50"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 shadow-md">

                  <User className="h-5 w-5 text-white" />

                </div>

              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                w-64
                rounded-3xl
                border-pink-100
                bg-white
                shadow-xl
                dark:border-slate-700
                dark:bg-slate-900
              "
            >

              <div className="p-4">

                <p className="font-semibold text-slate-700 dark:text-white">
                  {user?.name}
                </p>

                <p className="text-sm text-slate-500">
                  {user?.email}
                </p>

              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>

                <Link
                  href="/settings"
                  className="cursor-pointer"
                >

                  <Settings className="mr-2 h-4 w-4" />

                  Settings

                </Link>

              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500"
              >

                <LogOut className="mr-2 h-4 w-4" />

                Logout

              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>

    </header>

  )
}