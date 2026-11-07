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
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrading } from '@/context/trading-context'
import { useTheme } from '@/context/theme-context'

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Trade Journal', href: '/journal', icon: BookOpen },
  { name: 'AI Assistant', href: '/ai-coach', icon: Bot, isNew: true },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  { name: 'Export & Import', href: '/import', icon: UploadCloud },
  { name: 'Prop Firm Tracker', href: '/prop-firms', icon: ShieldAlert },
  { name: 'Psychology', href: '/psychology', icon: Brain },
  { name: 'Strategies', href: '/strategies', icon: TrendingUp },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Plans', href: '/plans', icon: Sparkles },
  { name: 'Settings', href: '/settings', icon: Settings },
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
        'relative flex flex-col border-r border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] transition-all duration-200 z-30 select-none overflow-hidden',
        isMobile ? 'w-72 h-full' : collapsed ? 'w-20' : 'w-64',
        'h-screen sticky top-0'
      )}
    >
      {/* 1. Brand Logo Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-[#E7EBF2] dark:border-slate-800/80">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group"
        >
          {/* KILAJO Institutional Brand Symbol */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3157D5] shadow-sm text-white shrink-0">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="3" y="14" width="3.5" height="7" rx="1" />
              <rect x="8.5" y="10" width="3.5" height="11" rx="1" />
              <rect x="14" y="6" width="3.5" height="15" rx="1" />
              <rect x="19.5" y="2" width="3.5" height="19" rx="1" />
            </svg>
          </div>

          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-[#172033] dark:text-white font-sans">
                KILAJO
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium tracking-wide">
                Trading Journal & Analytics
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

      {/* 2. User Profile Tile */}
      {(!collapsed || isMobile) ? (
        <div className="px-3 py-3 border-b border-[#E7EBF2] dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F6F8FC] dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
            <div className="relative h-9 w-9 shrink-0 rounded-full bg-[#EEF2FD] dark:bg-blue-950/80 border border-[#3157D5]/20 flex items-center justify-center font-bold text-[#3157D5] dark:text-blue-300 text-xs">
              {traderName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-[#172033] dark:text-white truncate">
                {traderName}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#3157D5] dark:text-blue-400">
                <span>Pro Trader</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-3 border-b border-[#E7EBF2] dark:border-slate-800/80">
          <div className="h-9 w-9 rounded-full bg-[#EEF2FD] dark:bg-blue-950/80 border border-[#3157D5]/20 flex items-center justify-center font-bold text-[#3157D5] dark:text-blue-300 text-xs">
            {traderName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      )}

      {/* 3. Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all group relative cursor-pointer',
                isActive
                  ? 'bg-[#EEF2FD] dark:bg-blue-950/60 text-[#3157D5] dark:text-blue-400'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F8FC] dark:hover:bg-slate-800/50'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 transition-colors shrink-0',
                  isActive ? 'text-[#3157D5] dark:text-blue-400' : 'text-[#64748B] dark:text-slate-400 group-hover:text-[#172033] dark:group-hover:text-white'
                )}
              />

              {(!collapsed || isMobile) && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {/* Tag indicator if present */}
              {item.isNew && (!collapsed || isMobile) && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#3157D5]/10 text-[#3157D5] dark:bg-blue-950 dark:text-blue-300">
                  AI
                </span>
              )}

              {/* Tooltip on collapsed state */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-3 hidden rounded-lg bg-[#172033] px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:block z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* 4. Sidebar Footer with Theme Toggle */}
      <div className="p-3 border-t border-[#E7EBF2] dark:border-slate-800">
        {(!collapsed || isMobile) ? (
          <div className="space-y-2">
            {/* Segmented Light / Dark Switch */}
            <div className="flex items-center justify-between rounded-xl bg-[#F6F8FC] dark:bg-slate-900 p-1 border border-[#E7EBF2] dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-xs transition-all cursor-pointer',
                  !isDark
                    ? 'bg-white text-[#172033] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-white'
                )}
              >
                <Sun className={cn('h-3.5 w-3.5', !isDark ? 'text-amber-500' : 'text-slate-400')} />
                <span>Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-xs transition-all cursor-pointer',
                  isDark
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#172033]'
                )}
              >
                <Moon className={cn('h-3.5 w-3.5', isDark ? 'text-indigo-400' : 'text-slate-400')} />
                <span>Dark</span>
              </button>
            </div>

            {/* Version */}
            <div className="flex items-center justify-between px-1 text-[11px] text-[#64748B] dark:text-slate-500 font-medium">
              <span>Universal Terminal</span>
              <span>v1.2.0</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
