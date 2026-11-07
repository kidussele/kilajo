'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageHeroBannerProps {
  title: string
  subtitle: string
  icon?: LucideIcon
  iconElement?: React.ReactNode
  quote?: string
  middleContent?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

/**
 * Institutional Fintech Page Header
 * Clean, space-efficient, professional fintech header aligned with the KILAJO Design System
 * Avoids screen-wasting 3D banners, ensuring maximum visibility for charts and trading tables.
 */
export function PageHeroBanner({
  title,
  subtitle,
  icon: Icon,
  iconElement,
  quote,
  middleContent,
  className,
  children,
}: PageHeroBannerProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] px-5 py-4 shadow-xs select-none transition-all',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand Icon Pill + Title + Subtitle */}
        <div className="flex items-center gap-3.5 min-w-0">
          {iconElement ? (
            <div className="shrink-0">{iconElement}</div>
          ) : Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FD] dark:bg-blue-950/60 text-[#3157D5] dark:text-blue-400 border border-[#3157D5]/15">
              <Icon className="h-5 w-5 stroke-[2.2]" />
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#172033] dark:text-white font-sans truncate">
                {title}
              </h1>
              {quote && (
                <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F6F8FC] dark:bg-slate-800 text-[#64748B] dark:text-slate-300 border border-[#E7EBF2] dark:border-slate-700">
                  <span className="text-[#3157D5] font-serif font-bold">“</span>
                  <span className="italic">{quote}</span>
                  <span className="text-[#3157D5] font-serif font-bold">”</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 font-medium leading-relaxed truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Middle Content (Scope pills, timeframe switchers, filters) */}
        {middleContent && (
          <div className="flex items-center shrink-0">
            {middleContent}
          </div>
        )}

        {/* Right Content: Children action buttons */}
        {children && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
