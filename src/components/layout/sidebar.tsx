'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  CalendarDays,
  Wallet,
  UploadCloud,
  ShieldAlert,
  Brain,
  Target,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FlaskConical,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrading } from '@/context/trading-context'

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Trading Journal', href: '/journal', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Import Center', href: '/import', icon: UploadCloud },
  { name: 'Prop Firm Tracker', href: '/prop-firms', icon: ShieldAlert },
  { name: 'Psychology & Discipline', href: '/psychology', icon: Brain },
  { name: 'Strategies', href: '/strategies', icon: TrendingUp },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ isMobile = false, onCloseMobile }: { isMobile?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { isDemoMode, toggleDemoMode } = useTrading()

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300 z-30 select-none',
        isMobile ? 'w-72 h-full' : collapsed ? 'w-20' : 'w-64',
        'h-screen sticky top-0'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 font-semibold text-lg tracking-tight group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <TrendingUp className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-bold tracking-wider text-base text-foreground font-mono">KILAJO</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-medium">
                Trading Terminal
              </span>
            </div>
          )}
        </Link>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {(!collapsed || isMobile) && <span className="truncate">{item.name}</span>}

              {/* Tooltip on collapsed state */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-3 hidden rounded-md bg-popover px-2.5 py-1 text-xs font-semibold text-popover-foreground shadow-md group-hover:block z-50 whitespace-nowrap border">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Demo Mode / Environment Badge */}
      <div className="p-3 border-t bg-muted/30">
        {(!collapsed || isMobile) ? (
          <div className="rounded-lg border bg-background p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <FlaskConical className={cn('h-3.5 w-3.5', isDemoMode ? 'text-amber-500' : 'text-muted-foreground')} />
                <span>Demo Data Mode</span>
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase',
                  isDemoMode ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-muted text-muted-foreground'
                )}
              >
                {isDemoMode ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">
              {isDemoMode
                ? 'Sample accounts and trades loaded for demonstration.'
                : 'Showing your isolated real production trading data.'}
            </p>
            <button
              onClick={() => toggleDemoMode(!isDemoMode)}
              className={cn(
                'w-full text-xs font-medium py-1.5 px-2 rounded border transition-colors flex items-center justify-center gap-1.5',
                isDemoMode
                  ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                  : 'border-border bg-card hover:bg-accent text-foreground'
              )}
            >
              <Sparkles className="h-3 w-3" />
              {isDemoMode ? 'Exit Demo Mode' : 'Explore with Demo Data'}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => toggleDemoMode(!isDemoMode)}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
              title={isDemoMode ? 'Exit Demo Mode' : 'Explore with Demo Data'}
            >
              <FlaskConical className={cn('h-4 w-4', isDemoMode ? 'text-amber-500' : '')} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
