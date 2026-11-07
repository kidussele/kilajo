'use client'

import React from 'react'
import {
  CalendarDays,
  TrendingUp,
  Scale,
  Clock,
  Hourglass,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SecondaryMetricRibbonProps {
  totalTrades: number
  avgRiskReward: string
  totalRewardRisk: string
  executionDrawdown: string
  recoveryFactor: string | number
  correlationSwap: string
  className?: string
}

export function SecondaryMetricRibbon({
  totalTrades,
  avgRiskReward,
  totalRewardRisk,
  executionDrawdown,
  recoveryFactor,
  correlationSwap,
  className,
}: SecondaryMetricRibbonProps) {
  const items = [
    {
      label: 'Total Trades',
      value: String(totalTrades),
      icon: CalendarDays,
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Avg. Risk / Reward',
      value: avgRiskReward,
      icon: TrendingUp,
      iconColor: 'text-teal-600',
    },
    {
      label: 'Total Reward / Risk',
      value: totalRewardRisk,
      icon: Scale,
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Execution Drawdown',
      value: executionDrawdown,
      icon: Clock,
      iconColor: 'text-amber-600',
    },
    {
      label: 'Recovery Factor',
      value: String(recoveryFactor),
      icon: Hourglass,
      iconColor: 'text-emerald-700',
    },
    {
      label: 'Correlation & Swap',
      value: correlationSwap,
      icon: Layers,
      iconColor: 'text-slate-600',
    },
  ]

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-2xl border border-slate-100 bg-white p-3 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100/90 text-xs select-none',
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          className={cn(
            'flex items-center gap-3 py-2 sm:py-0 px-3',
            idx === 0 && 'sm:pl-1',
            idx === items.length - 1 && 'sm:pr-1'
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
            <item.icon className={cn('h-3.5 w-3.5', item.iconColor)} />
          </div>
          <div className="truncate">
            <span className="block text-[11px] font-medium text-slate-400 truncate">
              {item.label}
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 tabular-nums">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

