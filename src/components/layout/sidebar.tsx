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
  const { isDemoMode, toggleDemoMode, userProfile, signOut } = useTrading()

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

      {/* Footer: Trader Status & Mode Switcher */}
      <div className="p-3 border-t bg-muted/20">
        {(!collapsed || isMobile) ? (
          <div className="rounded-lg border bg-card p-2.5 space-y-2 text-xs shadow-xs">
            {/* User Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                  {userProfile ? (userProfile.full_name?.[0] || 'T').toUpperCase() : 'G'}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-foreground text-[11px] truncate leading-tight">
                    {userProfile?.full_name || 'Guest Trader'}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {userProfile ? `${userProfile.base_currency} Account` : 'Offline / Preview'}
                  </p>
                </div>
              </div>

              {userProfile ? (
                <button
                  onClick={signOut}
                  className="text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors shrink-0 px-1"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-[11px] font-semibold text-primary hover:underline shrink-0"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mode Switcher Line */}
            <div className="pt-2 border-t flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                />
                {isDemoMode ? 'Demo Data' : 'Live Data'}
              </span>

              <button
                onClick={() => toggleDemoMode(!isDemoMode)}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors underline"
              >
                {isDemoMode ? 'Switch to Live' : 'Switch to Demo'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link
              href={userProfile ? '/settings' : '/login'}
              title={userProfile ? userProfile.full_name || 'Profile' : 'Sign In'}
              className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono"
            >
              {userProfile ? (userProfile.full_name?.[0] || 'T').toUpperCase() : 'G'}
            </Link>
            <button
              onClick={() => toggleDemoMode(!isDemoMode)}
              title={isDemoMode ? 'Demo Mode Active' : 'Live Mode Active'}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <span
                className={cn(
                  'block h-2 w-2 rounded-full',
                  isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'
                )}
              />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

