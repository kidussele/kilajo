'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export type MetricColor = 'emerald' | 'purple' | 'amber' | 'blue' | 'teal' | 'indigo' | 'rose'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  color?: MetricColor
  trend?: string
  trendPositive?: boolean
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  trend,
  trendPositive,
  className,
}: MetricCardProps) {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      waveFill: 'fill-emerald-500/10 stroke-emerald-500/20',
      textAccent: 'text-emerald-700',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      waveFill: 'fill-purple-500/10 stroke-purple-500/20',
      textAccent: 'text-purple-700',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      waveFill: 'fill-amber-500/10 stroke-amber-500/20',
      textAccent: 'text-amber-700',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      waveFill: 'fill-blue-500/10 stroke-blue-500/20',
      textAccent: 'text-blue-700',
    },
    teal: {
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
      waveFill: 'fill-teal-500/10 stroke-teal-500/20',
      textAccent: 'text-teal-700',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      waveFill: 'fill-indigo-500/10 stroke-indigo-500/20',
      textAccent: 'text-indigo-700',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      waveFill: 'fill-rose-500/10 stroke-rose-500/20',
      textAccent: 'text-rose-700',
    },
  }

  const activeColor = colorMap[color] || colorMap.emerald

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100/90 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:border-slate-200 select-none min-h-[120px]',
        className
      )}
    >
      {/* Top Header: Icon Pill + Title */}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', activeColor.iconBg)}>
            <Icon className="h-4 w-4 stroke-[2.2]" />
          </div>
        )}
        <p className="text-xs font-semibold text-slate-500 truncate">{title}</p>
      </div>

      {/* Main Value */}
      <div className="mt-2 relative z-10">
        <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
          {value}
        </h3>

        {/* Subtitle / Trend Line */}
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold',
                trendPositive !== undefined
                  ? trendPositive
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                  : 'text-slate-600'
              )}
            >
              {trend}
            </span>
          ) : null}
          {subtitle && (
            <span className="text-slate-400 truncate">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Bottom Subtle Wave Decoration */}
      <div className="absolute -bottom-1 -left-2 -right-2 h-7 pointer-events-none opacity-60">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,25 C40,35 70,10 110,20 C150,30 180,15 200,22 L200,40 L0,40 Z"
            className={activeColor.waveFill}
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  )
}
