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
      iconColor: 'text-[#3157D5] dark:text-blue-400',
      iconBg: 'bg-[#EEF2FD] dark:bg-blue-950/60 border border-[#3157D5]/20',
    },
    {
      label: 'Avg. Risk / Reward',
      value: avgRiskReward,
      icon: TrendingUp,
      iconColor: 'text-[#159B72] dark:text-emerald-400',
      iconBg: 'bg-[#E8F7F2] dark:bg-emerald-950/60 border border-[#159B72]/20',
    },
    {
      label: 'Total Reward / Risk',
      value: totalRewardRisk,
      icon: Scale,
      iconColor: 'text-[#6657C8] dark:text-purple-400',
      iconBg: 'bg-[#F2F0FB] dark:bg-purple-950/60 border border-[#6657C8]/20',
    },
    {
      label: 'Max Drawdown',
      value: executionDrawdown,
      icon: Clock,
      iconColor: 'text-[#E05260] dark:text-rose-400',
      iconBg: 'bg-[#FDEDEF] dark:bg-rose-950/60 border border-[#E05260]/20',
    },
    {
      label: 'Recovery Factor',
      value: String(recoveryFactor),
      icon: Hourglass,
      iconColor: 'text-[#E5A33B] dark:text-amber-400',
      iconBg: 'bg-[#FEF7EC] dark:bg-amber-950/60 border border-[#E5A33B]/20',
    },
    {
      label: 'Correlation & Swap',
      value: correlationSwap,
      icon: Layers,
      iconColor: 'text-[#6484A8] dark:text-slate-400',
      iconBg: 'bg-[#F6F8FC] dark:bg-slate-800 border border-[#E7EBF2] dark:border-slate-700',
    },
  ]

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-2.5 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-[#E7EBF2] dark:divide-slate-800 text-xs select-none transition-colors duration-200',
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          className={cn(
            'flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-[#F6F8FC] dark:hover:bg-slate-800/60 group',
            idx === 0 && 'sm:pl-2',
            idx === items.length - 1 && 'sm:pr-2'
          )}
        >
          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 shadow-2xs', item.iconBg)}>
            <item.icon className={cn('h-3.5 w-3.5 stroke-[2.2]', item.iconColor)} />
          </div>
          <div className="truncate">
            <span className="block text-[11px] font-medium text-[#64748B] group-hover:text-[#172033] dark:group-hover:text-slate-200 transition-colors truncate">
              {item.label}
            </span>
            <span className="font-bold font-mono text-[#172033] dark:text-white tabular-nums">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

