'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeroBannerProps {
  title: string
  subtitle: string
  icon: LucideIcon
  quote?: string
  badgeText?: string
  className?: string
  children?: React.ReactNode
}

export function PageHeroBanner({
  title,
  subtitle,
  icon: Icon,
  quote = 'Plan Well, Trade Smart, Grow Steady.',
  badgeText,
  className,
  children,
}: PageHeroBannerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-r from-emerald-50/95 via-teal-50/40 to-emerald-100/35 p-6 shadow-xs select-none',
        className
      )}
    >
      {/* Background Candlestick Silhouettes (Watermark) */}
      <svg
        className="absolute right-0 top-0 h-full w-2/3 pointer-events-none opacity-20 text-emerald-600"
        viewBox="0 0 600 160"
        fill="currentColor"
        preserveAspectRatio="none"
      >
        {/* Candlestick bars watermark */}
        <rect x="50" y="60" width="10" height="40" rx="2" />
        <line x1="55" y1="40" x2="55" y2="120" stroke="currentColor" strokeWidth="2" />

        <rect x="90" y="45" width="10" height="60" rx="2" />
        <line x1="95" y1="30" x2="95" y2="130" stroke="currentColor" strokeWidth="2" />

        <rect x="130" y="70" width="10" height="35" rx="2" />
        <line x1="135" y1="50" x2="135" y2="115" stroke="currentColor" strokeWidth="2" />

        <rect x="170" y="30" width="10" height="75" rx="2" />
        <line x1="175" y1="15" x2="175" y2="140" stroke="currentColor" strokeWidth="2" />

        <rect x="210" y="50" width="10" height="50" rx="2" />
        <line x1="215" y1="35" x2="215" y2="125" stroke="currentColor" strokeWidth="2" />

        <rect x="250" y="25" width="10" height="80" rx="2" />
        <line x1="255" y1="10" x2="255" y2="145" stroke="currentColor" strokeWidth="2" />

        <rect x="290" y="40" width="10" height="60" rx="2" />
        <line x1="295" y1="20" x2="295" y2="135" stroke="currentColor" strokeWidth="2" />

        <rect x="330" y="20" width="10" height="90" rx="2" />
        <line x1="335" y1="5" x2="335" y2="150" stroke="currentColor" strokeWidth="2" />

        <rect x="370" y="35" width="10" height="70" rx="2" />
        <line x1="375" y1="15" x2="375" y2="140" stroke="currentColor" strokeWidth="2" />

        <rect x="410" y="15" width="10" height="95" rx="2" />
        <line x1="415" y1="5" x2="415" y2="150" stroke="currentColor" strokeWidth="2" />

        <rect x="450" y="30" width="10" height="70" rx="2" />
        <line x1="455" y1="15" x2="455" y2="140" stroke="currentColor" strokeWidth="2" />

        <rect x="490" y="10" width="10" height="100" rx="2" />
        <line x1="495" y1="2" x2="495" y2="155" stroke="currentColor" strokeWidth="2" />
      </svg>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Icon + Heading + Subtitle */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100/80 text-emerald-800 shadow-inner ring-4 ring-white">
            <Icon className="h-8 w-8 text-emerald-700 stroke-[2.2]" />
            <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-400/30 animate-pulse pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                {title}
              </h1>
              {badgeText && (
                <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-600/20">
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Motivational Script Quote + Rising Arrow */}
        <div className="flex items-center justify-end gap-5">
          {children}

          {quote && (
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-base sm:text-lg font-serif italic text-slate-800 tracking-wide">
                &ldquo;{quote}&rdquo;
              </span>
            </div>
          )}

          {/* 3D Rising Trending Arrow Graphic */}
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <svg
              className="h-8 w-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
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

