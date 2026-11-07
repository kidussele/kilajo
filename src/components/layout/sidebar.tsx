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
import { useTheme } from '@/context/theme-context'

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-emerald-500 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-800/50', badgeColor: 'bg-emerald-100 text-emerald-700' },
  { name: 'Trade Journal', href: '/journal', icon: BookOpen, color: 'text-teal-500 dark:text-teal-400', iconBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100/80 dark:border-teal-800/50', badgeColor: 'bg-teal-100 text-teal-700' },
  { name: 'Analytics', href: '/analytics', icon: LineChart, color: 'text-blue-500 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-800/50', badgeColor: 'bg-blue-100 text-blue-700' },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-800/50', badgeColor: 'bg-emerald-100 text-emerald-700' },
  { name: 'Reports', href: '/reports', icon: FileSpreadsheet, color: 'text-purple-500 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100/80 dark:border-purple-800/50', badgeColor: 'bg-purple-100 text-purple-700' },
  { name: 'Export Data', href: '/import', icon: UploadCloud, color: 'text-sky-500 dark:text-sky-400', iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100/80 dark:border-sky-800/50', badgeColor: 'bg-sky-100 text-sky-700' },
  { name: 'Prop Firm Tracker', href: '/prop-firms', icon: ShieldAlert, color: 'text-amber-500 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100/80 dark:border-amber-800/50', badgeColor: 'bg-amber-100 text-amber-700' },
  { name: 'Psychology & Discipline', href: '/psychology', icon: Brain, color: 'text-rose-500 dark:text-rose-400', iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100/80 dark:border-rose-800/50', badgeColor: 'bg-rose-100 text-rose-700' },
  { name: 'Strategies', href: '/strategies', icon: TrendingUp, color: 'text-emerald-500 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-800/50', badgeColor: 'bg-emerald-100 text-emerald-700' },
  { name: 'Goals', href: '/goals', icon: Target, color: 'text-indigo-500 dark:text-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-800/50', badgeColor: 'bg-indigo-100 text-indigo-700' },
  { name: 'Plans', href: '/plans', icon: Sparkles, color: 'text-amber-500 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100/80 dark:border-amber-800/50', badgeColor: 'bg-amber-100 text-amber-700' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-slate-500 dark:text-slate-400', iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700', badgeColor: 'bg-slate-100 text-slate-700' },
]

export function Sidebar({ isMobile = false, onCloseMobile }: { isMobile?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { userProfile } = useTrading()
  const { isDark, setTheme, toggleTheme } = useTheme()

  const traderName = userProfile?.full_name || 'Kidus Seleshi'

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[#e8eeea] dark:border-slate-800/90 bg-white dark:bg-[#0c141c] transition-all duration-300 z-30 select-none overflow-hidden',
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
              <span className="font-extrabold tracking-tight text-xl text-slate-900 dark:text-white font-sans">
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
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* 2. User Profile Tile (under logo) */}
      {(!collapsed || isMobile) ? (
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-300/60 dark:border-emerald-700/60 overflow-hidden flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-300 text-sm">
              {traderName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {traderName}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Pro Trader</span>
                <ChevronDown className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-300/60 dark:border-emerald-700/60 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-300 text-xs">
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
                'flex items-center gap-3 rounded-2xl px-3 py-2 text-xs sm:text-sm font-medium transition-all group relative cursor-pointer',
                isActive
                  ? 'bg-[#064e3b] text-white shadow-md shadow-[#064e3b]/25 font-semibold translate-x-0.5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/90 dark:hover:bg-slate-800/60 hover:translate-x-1 hover:shadow-2xs'
              )}
            >
              {/* Colorful icon badge */}
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 shrink-0 group-hover:scale-110',
                  isActive
                    ? 'bg-white/15 text-white'
                    : item.iconBg
                )}
              >
                <item.icon
                  className={cn(
                    'h-3.5 w-3.5 transition-colors stroke-[2.2]',
                    isActive ? 'text-white' : item.color
                  )}
                />
              </div>

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
            <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-amber-50/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-3 shadow-2xs flex items-center gap-3 cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-2xs">
                <Trophy className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Discipline Today,
                </p>
                <p className="font-medium text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Freedom Tomorrow
                </p>
              </div>
            </div>

            {/* Segmented Light / Dark Switch */}
            <div className="flex items-center justify-between rounded-full bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/50 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 text-xs transition-all cursor-pointer',
                  !isDark
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Sun className={cn('h-3.5 w-3.5', !isDark ? 'text-amber-500' : 'text-slate-400')} />
                <span>Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 text-xs transition-all cursor-pointer',
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
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <span>v1.0.0</span>
              <span>|</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Kilajo</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 cursor-pointer hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5" />
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>
          </div>
        )}

        {/* Soft background mint wave decoration at bottom */}
        <div className="absolute -bottom-2 -left-2 -right-2 h-10 pointer-events-none opacity-30 dark:opacity-10 z-0">
          <svg
            className="w-full h-full text-emerald-300 dark:text-emerald-800"
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
