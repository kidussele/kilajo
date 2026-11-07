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
        'relative overflow-hidden rounded-3xl border border-[#a7f3d0] bg-gradient-to-r from-[#dcfce7]/95 via-[#f0fdf4]/80 to-[#ecfdf5]/95 px-6 py-5 shadow-xs select-none',
        className
      )}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
      <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

      {/* Motivating Bull Market Candlestick Wave & Rising Trend Trajectory */}
      <svg
        className="absolute right-0 bottom-0 h-full w-3/5 sm:w-1/2 pointer-events-none overflow-visible"
        viewBox="0 0 500 130"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Lush Green Slope Gradient */}
          <linearGradient id="hero-slope-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.04" />
          </linearGradient>

          {/* Secondary Soft Wave Slope */}
          <linearGradient id="hero-secondary-slope" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>

          {/* Candlestick Body Gradient */}
          <linearGradient id="hero-candle-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* Ascending Bull-Run Candlesticks with Wicks */}
        {/* Candle 1 */}
        <line x1="45" y1="65" x2="45" y2="115" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.65" />
        <rect x="41" y="75" width="8" height="30" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 2 */}
        <line x1="80" y1="55" x2="80" y2="110" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.65" />
        <rect x="76" y="65" width="8" height="35" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 3 */}
        <line x1="115" y1="70" x2="115" y2="105" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.7" />
        <rect x="111" y="80" width="8" height="20" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 4 */}
        <line x1="150" y1="42" x2="150" y2="105" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.75" />
        <rect x="146" y="52" width="8" height="45" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 5 */}
        <line x1="185" y1="48" x2="185" y2="95" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.75" />
        <rect x="181" y="58" width="8" height="30" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 6 */}
        <line x1="220" y1="32" x2="220" y2="90" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.8" />
        <rect x="216" y="42" width="8" height="42" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 7 */}
        <line x1="255" y1="22" x2="255" y2="85" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.85" />
        <rect x="251" y="32" width="8" height="46" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 8 */}
        <line x1="290" y1="14" x2="290" y2="78" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.9" />
        <rect x="286" y="24" width="8" height="48" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 9 */}
        <line x1="325" y1="6" x2="325" y2="70" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.95" />
        <rect x="321" y="16" width="8" height="50" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 10 */}
        <line x1="360" y1="2" x2="360" y2="65" stroke="#10b981" strokeWidth="1.5" strokeOpacity="1" />
        <rect x="356" y="10" width="8" height="52" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 11 */}
        <line x1="395" y1="0" x2="395" y2="60" stroke="#10b981" strokeWidth="1.5" strokeOpacity="1" />
        <rect x="391" y="6" width="8" height="50" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Candle 12 */}
        <line x1="430" y1="0" x2="430" y2="55" stroke="#10b981" strokeWidth="1.5" strokeOpacity="1" />
        <rect x="426" y="4" width="8" height="48" rx="1.5" fill="url(#hero-candle-green)" />

        {/* Secondary Soft Green Hill */}
        <path
          d="M 0,110 Q 120,105 240,75 T 480,25 L 480,130 L 0,130 Z"
          fill="url(#hero-secondary-slope)"
        />

        {/* Primary Green Rising Slope Surface */}
        <path
          d="M 20,120 Q 150,115 280,75 T 490,20 L 490,130 L 20,130 Z"
          fill="url(#hero-slope-gradient)"
        />

        {/* Soaring Trajectory Curve */}
        <path
          d="M 20,120 Q 150,115 280,75 T 480,20"
          fill="none"
          stroke="#10b981"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Glowing Trajectory Dash Line */}
        <path
          d="M 40,110 Q 160,105 290,68 T 480,15"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeOpacity="0.8"
        />

        {/* Ascending Trend Arrow Emerging from Slope */}
        <path
          d="M 470,26 L 492,16 L 484,38 L 478,30 L 455,48 L 447,40 L 470,22 Z"
          fill="#059669"
          stroke="#10b981"
          strokeWidth="1.5"
          filter="drop-shadow(0 2px 4px rgba(5, 150, 105, 0.4))"
        />
      </svg>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* 1. Left Side: Icon + Heading + Subtitle */}
        <div className="flex items-center gap-4 min-w-0">
          {iconElement ? (
            iconElement
          ) : Icon ? (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#059669] text-white shadow-md shadow-emerald-900/20">
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
                <span className="text-sm sm:text-base font-serif italic text-slate-800 tracking-wide font-bold">
                  &ldquo;{quote}&rdquo;
                </span>
              </div>
            </>
          )}

          {/* 3D Rising Trending Arrow Badge */}
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#059669] via-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/25 transition-transform hover:scale-105">
            <svg
              className="h-6 w-6 text-white drop-shadow-sm"
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
