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
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    },
    {
      label: 'Avg. Risk / Reward',
      value: avgRiskReward,
      icon: TrendingUp,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
    },
    {
      label: 'Total Reward / Risk',
      value: totalRewardRisk,
      icon: Scale,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    },
    {
      label: 'Execution Drawdown',
      value: executionDrawdown,
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
    },
    {
      label: 'Recovery Factor',
      value: String(recoveryFactor),
      icon: Hourglass,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
    },
    {
      label: 'Correlation & Swap',
      value: correlationSwap,
      icon: Layers,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
    },
  ]

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100/90 text-xs select-none',
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          className={cn(
            'flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-slate-50/80 hover:shadow-2xs group',
            idx === 0 && 'sm:pl-2',
            idx === items.length - 1 && 'sm:pr-2'
          )}
        >
          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 shadow-2xs', item.iconBg)}>
            <item.icon className={cn('h-3.5 w-3.5 stroke-[2.2]', item.iconColor)} />
          </div>
          <div className="truncate">
            <span className="block text-[11px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors truncate">
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

