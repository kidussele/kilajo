'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export type MetricColor = 'emerald' | 'purple' | 'amber' | 'blue' | 'teal' | 'indigo' | 'rose' | 'profit' | 'loss' | 'brand' | 'analytics' | 'warning'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  color?: MetricColor
  trend?: string
  trendPositive?: boolean
  className?: string
  infoTooltip?: boolean
  actionArrow?: boolean
  onActionClick?: () => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'brand',
  trend,
  trendPositive,
  className,
  infoTooltip = false,
  actionArrow = false,
  onActionClick,
}: MetricCardProps) {
  // Institutional KILAJO color mappings
  const colorMap: Record<string, { iconBg: string; stroke: string; secondaryStroke: string; textAccent: string }> = {
    profit: {
      iconBg: 'bg-[#E8F7F2] dark:bg-emerald-950/60 text-[#159B72] dark:text-emerald-400 border border-[#159B72]/20',
      stroke: '#159B72',
      secondaryStroke: '#34d399',
      textAccent: 'text-[#159B72] dark:text-emerald-400',
    },
    emerald: {
      iconBg: 'bg-[#E8F7F2] dark:bg-emerald-950/60 text-[#159B72] dark:text-emerald-400 border border-[#159B72]/20',
      stroke: '#159B72',
      secondaryStroke: '#34d399',
      textAccent: 'text-[#159B72] dark:text-emerald-400',
    },
    loss: {
      iconBg: 'bg-[#FDEDEF] dark:bg-rose-950/60 text-[#E05260] dark:text-rose-400 border border-[#E05260]/20',
      stroke: '#E05260',
      secondaryStroke: '#f87171',
      textAccent: 'text-[#E05260] dark:text-rose-400',
    },
    rose: {
      iconBg: 'bg-[#FDEDEF] dark:bg-rose-950/60 text-[#E05260] dark:text-rose-400 border border-[#E05260]/20',
      stroke: '#E05260',
      secondaryStroke: '#f87171',
      textAccent: 'text-[#E05260] dark:text-rose-400',
    },
    brand: {
      iconBg: 'bg-[#EEF2FD] dark:bg-blue-950/60 text-[#3157D5] dark:text-blue-400 border border-[#3157D5]/20',
      stroke: '#3157D5',
      secondaryStroke: '#60a5fa',
      textAccent: 'text-[#3157D5] dark:text-blue-400',
    },
    blue: {
      iconBg: 'bg-[#EEF2FD] dark:bg-blue-950/60 text-[#3157D5] dark:text-blue-400 border border-[#3157D5]/20',
      stroke: '#3157D5',
      secondaryStroke: '#60a5fa',
      textAccent: 'text-[#3157D5] dark:text-blue-400',
    },
    analytics: {
      iconBg: 'bg-[#F2F0FB] dark:bg-purple-950/60 text-[#6657C8] dark:text-purple-400 border border-[#6657C8]/20',
      stroke: '#6657C8',
      secondaryStroke: '#a78bfa',
      textAccent: 'text-[#6657C8] dark:text-purple-400',
    },
    purple: {
      iconBg: 'bg-[#F2F0FB] dark:bg-purple-950/60 text-[#6657C8] dark:text-purple-400 border border-[#6657C8]/20',
      stroke: '#6657C8',
      secondaryStroke: '#a78bfa',
      textAccent: 'text-[#6657C8] dark:text-purple-400',
    },
    indigo: {
      iconBg: 'bg-[#F2F0FB] dark:bg-purple-950/60 text-[#6657C8] dark:text-purple-400 border border-[#6657C8]/20',
      stroke: '#6657C8',
      secondaryStroke: '#a78bfa',
      textAccent: 'text-[#6657C8] dark:text-purple-400',
    },
    warning: {
      iconBg: 'bg-[#FEF7EC] dark:bg-amber-950/60 text-[#E5A33B] dark:text-amber-400 border border-[#E5A33B]/20',
      stroke: '#E5A33B',
      secondaryStroke: '#fbbf24',
      textAccent: 'text-[#E5A33B] dark:text-amber-400',
    },
    amber: {
      iconBg: 'bg-[#FEF7EC] dark:bg-amber-950/60 text-[#E5A33B] dark:text-amber-400 border border-[#E5A33B]/20',
      stroke: '#E5A33B',
      secondaryStroke: '#fbbf24',
      textAccent: 'text-[#E5A33B] dark:text-amber-400',
    },
    teal: {
      iconBg: 'bg-[#E8F7F2] dark:bg-emerald-950/60 text-[#159B72] dark:text-emerald-400 border border-[#159B72]/20',
      stroke: '#159B72',
      secondaryStroke: '#2dd4bf',
      textAccent: 'text-[#159B72] dark:text-emerald-400',
    },
  }

  const activeColor = colorMap[color] || colorMap.brand
  const gradientId = `wave-grad-${color}-${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#3157D5]/40 dark:hover:border-blue-700/60 cursor-pointer select-none min-h-[110px] group',
        className
      )}
    >
      {/* Top Header: Icon Pill + Title + Optional Info and Action Arrow */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-2xs group-hover:scale-105 transition-transform duration-200', activeColor.iconBg)}>
              <Icon className="h-4 w-4 stroke-[2.2]" />
            </div>
          )}
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 group-hover:text-[#172033] dark:group-hover:text-white transition-colors truncate">{title}</p>
            {infoTooltip && (
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-[#64748B] hover:text-[#172033] dark:hover:text-slate-200 border border-[#E7EBF2] dark:border-slate-700 cursor-pointer transition-colors">
                i
              </span>
            )}
          </div>
        </div>

        {actionArrow && (
          <button
            type="button"
            onClick={onActionClick}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E7EBF2] dark:border-slate-800 text-[#64748B] group-hover:text-[#3157D5] dark:group-hover:text-blue-400 group-hover:border-[#3157D5]/30 group-hover:bg-[#EEF2FD] dark:group-hover:bg-blue-950/40 transition-all shrink-0 cursor-pointer"
          >
            <svg className="h-3 w-3 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Value */}
      <div className="mt-2.5 relative z-10">
        <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#172033] dark:text-white tabular-nums">
          {value}
        </h3>

        {/* Subtitle / Trend Line */}
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                trendPositive !== undefined
                  ? trendPositive
                    ? 'text-[#159B72] dark:text-emerald-400'
                    : 'text-[#E05260] dark:text-rose-400'
                  : 'text-[#64748B] dark:text-slate-400'
              )}
            >
              {trend}
            </span>
          ) : null}
          {subtitle && (
            <span className="text-[#64748B] dark:text-slate-400 truncate">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Subtle Bottom Accent Spark Wave */}
      <div className="absolute -bottom-0.5 left-0 right-0 h-8 pointer-events-none overflow-hidden select-none opacity-40 group-hover:opacity-60 transition-opacity">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 35"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor.stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={activeColor.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M0,22 C40,30 75,12 115,20 C155,28 178,14 200,20 L200,35 L0,35 Z"
            fill={`url(#${gradientId})`}
          />
          <path
            d="M0,22 C40,30 75,12 115,20 C155,28 178,14 200,20"
            fill="none"
            stroke={activeColor.stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
