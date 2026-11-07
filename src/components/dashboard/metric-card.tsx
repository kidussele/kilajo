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
  infoTooltip?: boolean
  actionArrow?: boolean
  onActionClick?: () => void
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
  infoTooltip = false,
  actionArrow = false,
  onActionClick,
}: MetricCardProps) {
  const colorMap = {
    emerald: {
      iconBg: 'bg-[#ecfdf5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 border border-[#a7f3d0] dark:border-emerald-800/60',
      stroke: '#10b981',
      secondaryStroke: '#34d399',
      textAccent: 'text-emerald-700 dark:text-emerald-400',
    },
    purple: {
      iconBg: 'bg-[#f5f3ff] dark:bg-purple-950/60 text-[#7c3aed] dark:text-purple-400 border border-[#ddd6fe] dark:border-purple-800/60',
      stroke: '#a855f7',
      secondaryStroke: '#c084fc',
      textAccent: 'text-purple-700 dark:text-purple-400',
    },
    amber: {
      iconBg: 'bg-[#fffbeb] dark:bg-amber-950/60 text-[#d97706] dark:text-amber-400 border border-[#fde68a] dark:border-amber-800/60',
      stroke: '#f59e0b',
      secondaryStroke: '#fbbf24',
      textAccent: 'text-amber-700 dark:text-amber-400',
    },
    blue: {
      iconBg: 'bg-[#eff6ff] dark:bg-blue-950/60 text-[#2563eb] dark:text-blue-400 border border-[#bfdbfe] dark:border-blue-800/60',
      stroke: '#3b82f6',
      secondaryStroke: '#60a5fa',
      textAccent: 'text-blue-700 dark:text-blue-400',
    },
    teal: {
      iconBg: 'bg-[#f0fdfa] dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 border border-[#99f6e4] dark:border-teal-800/60',
      stroke: '#14b8a6',
      secondaryStroke: '#2dd4bf',
      textAccent: 'text-teal-700 dark:text-teal-400',
    },
    indigo: {
      iconBg: 'bg-[#eef2ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 border border-[#c7d2fe] dark:border-indigo-800/60',
      stroke: '#8b5cf6',
      secondaryStroke: '#a78bfa',
      textAccent: 'text-indigo-700 dark:text-indigo-400',
    },
    rose: {
      iconBg: 'bg-[#fff1f2] dark:bg-rose-950/60 text-[#e11d48] dark:text-rose-400 border border-[#fecdd3] dark:border-rose-800/60',
      stroke: '#f43f5e',
      secondaryStroke: '#fb7185',
      textAccent: 'text-rose-700 dark:text-rose-400',
    },
  }

  const activeColor = colorMap[color] || colorMap.emerald
  const gradientId = `wave-grad-${color}-${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100/90 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-4 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300/80 dark:hover:border-slate-700 cursor-pointer select-none min-h-[120px] group',
        className
      )}
    >
      {/* Top Header: Icon Pill + Title + Optional Info and Action Arrow */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-2xs group-hover:scale-110 transition-transform duration-200', activeColor.iconBg)}>
              <Icon className="h-4 w-4 stroke-[2.2]" />
            </div>
          )}
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">{title}</p>
            {infoTooltip && (
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors">
                i
              </span>
            )}
          </div>
        </div>

        {actionArrow && (
          <button
            type="button"
            onClick={onActionClick}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:border-emerald-300 dark:group-hover:border-emerald-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-all shrink-0 cursor-pointer"
          >
            <svg className="h-3 w-3 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Value */}
      <div className="mt-2 relative z-10">
        <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
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
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              {trend}
            </span>
          ) : null}
          {subtitle && (
            <span className="text-slate-400 dark:text-slate-500 truncate">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Bottom Fluid Colored Wave Decoration Matching Screenshot */}
      <div className="absolute -bottom-0.5 left-0 right-0 h-10 pointer-events-none overflow-hidden select-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 45"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor.stroke} stopOpacity="0.32" />
              <stop offset="100%" stopColor={activeColor.stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Secondary background flowing wave */}
          <path
            d="M0,26 C35,16 70,36 110,22 C150,12 175,28 200,18 L200,45 L0,45 Z"
            fill={activeColor.secondaryStroke}
            fillOpacity="0.18"
          />

          {/* Primary foreground wave with gradient and crisp stroke */}
          <path
            d="M0,30 C40,38 75,18 115,26 C155,34 178,20 200,26 L200,45 L0,45 Z"
            fill={`url(#${gradientId})`}
          />
          <path
            d="M0,30 C40,38 75,18 115,26 C155,34 178,20 200,26"
            fill="none"
            stroke={activeColor.stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
