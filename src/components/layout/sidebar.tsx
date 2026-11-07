'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  BarChart3,
  Folder,
  Flag,
  Users,
  ShieldCheck,
  Settings,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-context'

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Trade Journal', href: '/journal', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Accounts', href: '/accounts', icon: Folder },
  { name: 'Calendar', href: '/calendar', icon: Flag },
  { name: 'Psychology', href: '/psychology', icon: Users },
  { name: 'Prop Firms', href: '/prop-firms', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Future Plans', href: '/plans', icon: HelpCircle },
  { name: 'AI Coach', href: '/ai-coach', icon: MessageSquare },
]

export function Sidebar({
  isMobile = false,
  onCloseMobile,
}: {
  isMobile?: boolean
  onCloseMobile?: () => void
}) {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()

  return (
    <aside
      className={cn(
        'flex flex-col items-center justify-between py-5 transition-all duration-200 select-none bg-white dark:bg-[#0c141c]',
        isMobile ? 'w-72 px-4' : 'w-[72px] sm:w-[76px]'
      )}
    >
      {/* 1. Top Brand Logo Emblem (Matching Reference UI: dark navy pebble badge) */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
          title="Kilajo Trading Platform"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e3a8a] text-white shadow-md shadow-blue-950/20 group-hover:scale-105 transition-transform duration-200">
            {/* Dual geometric organic pebbles SVG */}
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" fill="none">
              <path d="M7 6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V11C13 12.6569 11.6569 14 10 14C8.34315 14 7 12.6569 7 11V6Z" />
              <circle cx="16" cy="16" r="4" fill="white" />
            </svg>
          </div>
          {isMobile && (
            <span className="font-extrabold text-lg text-slate-900 dark:text-white font-sans tracking-tight">
              KILAJO
            </span>
          )}
        </Link>

        {/* 2. Navigation Icon Stack */}
        <nav className="flex flex-col items-center space-y-2 w-full">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

            return (
              <div key={item.name} className="relative group w-full flex justify-center">
                {/* Active Left Indicator Bar */}
                {isActive && !isMobile && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#1e3a8a] dark:bg-cyan-400" />
                )}

                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3.5 p-2.5 rounded-2xl transition-all duration-150 cursor-pointer',
                    isMobile && 'w-full px-4 py-2.5',
                    isActive
                      ? 'text-[#1e3a8a] dark:text-cyan-400 bg-blue-50/80 dark:bg-slate-800/80 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                  title={item.name}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 stroke-[2] shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'stroke-[2.4]' : ''
                    )}
                  />
                  {isMobile && (
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  )}
                </Link>

                {/* Desktop Tooltip on Hover */}
                {!isMobile && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.name}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* 3. Bottom Controls: Dark Mode Toggle */}
      <div className="flex flex-col items-center gap-3 pt-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
