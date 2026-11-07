'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeroBannerProps {
  title: string
  subtitle: string
  icon?: LucideIcon
  iconElement?: React.ReactNode
  quote?: string
  middleContent?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function PageHeroBanner({
  title,
  subtitle,
  icon: Icon,
  iconElement,
  quote = 'Plan Well, Trade Smart, Grow Steady.',
  middleContent,
  className,
  children,
}: PageHeroBannerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-[#a7f3d0] bg-gradient-to-r from-[#dcfce7]/90 via-[#f0fdf4]/75 to-[#dcfce7]/85 px-6 py-5 shadow-xs select-none',
        className
      )}
    >
      {/* Background Candlestick Watermark Graphic */}
      <svg
        className="absolute right-0 top-0 h-full w-1/2 pointer-events-none opacity-25 text-emerald-600"
        viewBox="0 0 450 120"
        fill="currentColor"
        preserveAspectRatio="none"
      >
        <rect x="50" y="45" width="7" height="35" rx="1.5" />
        <line x1="53.5" y1="30" x2="53.5" y2="90" stroke="currentColor" strokeWidth="1.5" />

        <rect x="85" y="35" width="7" height="45" rx="1.5" />
        <line x1="88.5" y1="20" x2="88.5" y2="95" stroke="currentColor" strokeWidth="1.5" />

        <rect x="120" y="50" width="7" height="25" rx="1.5" />
        <line x1="123.5" y1="40" x2="123.5" y2="85" stroke="currentColor" strokeWidth="1.5" />

        <rect x="155" y="25" width="7" height="55" rx="1.5" />
        <line x1="158.5" y1="10" x2="158.5" y2="100" stroke="currentColor" strokeWidth="1.5" />

        <rect x="190" y="40" width="7" height="40" rx="1.5" />
        <line x1="193.5" y1="25" x2="193.5" y2="95" stroke="currentColor" strokeWidth="1.5" />

        <rect x="225" y="20" width="7" height="60" rx="1.5" />
        <line x1="228.5" y1="5" x2="228.5" y2="105" stroke="currentColor" strokeWidth="1.5" />

        <rect x="260" y="30" width="7" height="50" rx="1.5" />
        <line x1="263.5" y1="15" x2="263.5" y2="100" stroke="currentColor" strokeWidth="1.5" />

        <rect x="295" y="15" width="7" height="65" rx="1.5" />
        <line x1="298.5" y1="5" x2="298.5" y2="110" stroke="currentColor" strokeWidth="1.5" />

        <rect x="330" y="25" width="7" height="55" rx="1.5" />
        <line x1="333.5" y1="10" x2="333.5" y2="100" stroke="currentColor" strokeWidth="1.5" />

        <rect x="365" y="10" width="7" height="70" rx="1.5" />
        <line x1="368.5" y1="2" x2="368.5" y2="115" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* 1. Left Side: Icon + Heading + Subtitle */}
        <div className="flex items-center gap-4 min-w-0">
          {iconElement ? (
            iconElement
          ) : Icon ? (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-white shadow-md shadow-emerald-900/20">
              <Icon className="h-7 w-7 text-white stroke-[2.2]" />
            </div>
          ) : null}

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-600 mt-0.5 max-w-xl font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 2. Middle Content (Pills / Buttons / Nav) */}
        {middleContent && (
          <div className="flex items-center justify-center shrink-0">
            {middleContent}
          </div>
        )}

        {/* 3. Right Side: Vertical Divider + Quote + 3D Arrow */}
        <div className="flex items-center justify-end gap-5 shrink-0">
          {children}

          {quote && (
            <>
              <div className="hidden lg:block h-10 w-[1px] bg-slate-300/60" />
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm sm:text-base font-serif italic text-slate-800 tracking-wide font-medium">
                  &ldquo;{quote}&rdquo;
                </span>
              </div>
            </>
          )}

          {/* 3D Rising Trending Arrow Badge */}
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
