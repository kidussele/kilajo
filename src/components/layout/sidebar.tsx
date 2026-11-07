'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  CalendarDays,
  FileSpreadsheet,
  UploadCloud,
  ShieldAlert,
  Brain,
  TrendingUp,
  Target,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Trophy,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrading } from '@/context/trading-context'

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Trade Journal', href: '/journal', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  { name: 'Export Data', href: '/import', icon: UploadCloud },
  { name: 'Prop Firm Tracker', href: '/prop-firms', icon: ShieldAlert },
  { name: 'Psychology & Discipline', href: '/psychology', icon: Brain },
  { name: 'Strategies', href: '/strategies', icon: TrendingUp },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Plans', href: '/plans', icon: Sparkles },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ isMobile = false, onCloseMobile }: { isMobile?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { userProfile, isDemoMode, toggleDemoMode } = useTrading()
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const traderName = userProfile?.full_name || 'Kidus Seleshi'

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[#e8eeea] bg-white transition-all duration-300 z-30 select-none overflow-hidden',
        isMobile ? 'w-72 h-full' : collapsed ? 'w-20' : 'w-64',
        'h-screen sticky top-0'
      )}
    >
      {/* 1. Brand Logo Header */}
      <div className="flex h-20 items-center justify-between px-5 pt-4">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          {/* Green 4-bar stylized chart icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 shadow-md shadow-emerald-700/20 text-white shrink-0">
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="3" y="14" width="3.5" height="7" rx="1.5" />
              <rect x="8.5" y="10" width="3.5" height="11" rx="1.5" />
              <rect x="14" y="6" width="3.5" height="15" rx="1.5" />
              <rect x="19.5" y="2" width="3.5" height="19" rx="1.5" />
            </svg>
          </div>

          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-xl text-slate-900 font-sans">
                KILAJO
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Trade • Learn • Grow
              </span>
            </div>
          )}
        </Link>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* 2. User Profile Tile (under logo) */}
      {(!collapsed || isMobile) ? (
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-emerald-100 border-2 border-emerald-300/60 overflow-hidden flex items-center justify-center font-bold text-emerald-800 text-sm">
              {traderName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-slate-900 truncate">
                {traderName}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span>Pro Trader</span>
                <ChevronDown className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 border-2 border-emerald-300/60 flex items-center justify-center font-bold text-emerald-800 text-xs">
            {traderName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      )}

      {/* 3. Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-[#064e3b] text-white shadow-sm shadow-[#064e3b]/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/40'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-white stroke-[2.2]' : 'text-slate-400 group-hover:text-slate-700 stroke-[1.8]'
                )}
              />
              {(!collapsed || isMobile) && <span className="truncate">{item.name}</span>}

              {/* Tooltip on collapsed state */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-3 hidden rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* 4. Sidebar Footer with Motivational Trophy Card + Theme Toggle */}
      <div className="p-3 pt-2 relative">
        {(!collapsed || isMobile) ? (
          <div className="space-y-3">
            {/* Motivational Trophy Card */}
            <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 p-3 shadow-2xs flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600">
                <Trophy className="h-5 w-5 text-amber-600 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] text-slate-800 leading-tight">
                  Discipline Today,
                </p>
                <p className="font-medium text-[10px] text-slate-500 leading-tight mt-0.5">
                  Freedom Tomorrow
                </p>
              </div>
            </div>

            {/* Segmented Light / Dark Switch */}
            <div className="flex items-center justify-between rounded-full bg-slate-100 p-1 border border-slate-200/50 text-xs font-semibold">
              <button
                onClick={() => toggleTheme(false)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 text-xs transition-all',
                  !isDark
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <Sun className={cn('h-3.5 w-3.5', !isDark ? 'text-amber-500' : 'text-slate-400')} />
                <span>Light</span>
              </button>

              <button
                onClick={() => toggleTheme(true)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 text-xs transition-all',
                  isDark
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <Moon className={cn('h-3.5 w-3.5', isDark ? 'text-indigo-400' : 'text-slate-400')} />
                <span>Dark</span>
              </button>
            </div>

            {/* Version & Brand Tag */}
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
              <span>v1.0.0</span>
              <span>|</span>
              <span className="font-semibold text-emerald-700">Kilajo</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <button
              onClick={() => toggleTheme(!isDark)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              title="Toggle theme"
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>
          </div>
        )}

        {/* Soft background mint wave decoration at bottom */}
        <div className="absolute -bottom-2 -left-2 -right-2 h-10 pointer-events-none opacity-30 z-0">
          <svg
            className="w-full h-full text-emerald-300"
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 C50,35 120,5 200,25 L200,40 L0,40 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </aside>
  )
}
