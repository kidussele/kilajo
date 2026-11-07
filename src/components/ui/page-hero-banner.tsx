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

/**
 * High-fidelity 3D Isometric Platform Graphic
 * Features:
 * - 2 floating frosted glass tiles in background
 * - 3D isometric frosted glass platform with glossy bevel
 * - 4 vertical 3D ascending gradient bars (cyan, blue, indigo, violet)
 * - 3D neon-green curved bull trajectory arrow
 * - 3D shiny golden coin with embossed '$' symbol
 */
function IsometricHeroBadge() {
  return (
    <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 flex items-center justify-center select-none group cursor-pointer hover:scale-105 transition-transform duration-300">
      <svg
        viewBox="0 0 110 110"
        className="h-full w-full overflow-visible drop-shadow-[0_8px_20px_rgba(99,102,241,0.25)] dark:drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
        fill="none"
      >
        <defs>
          {/* Glass screen gradient */}
          <linearGradient id="iso-glass-screen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#e0e7ff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.25" />
          </linearGradient>

          {/* Glass floor gradient */}
          <linearGradient id="iso-glass-floor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.3" />
          </linearGradient>

          {/* Glass floor edge */}
          <linearGradient id="iso-glass-edge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
          </linearGradient>

          {/* Bar 1 (Cyan) */}
          <linearGradient id="iso-bar1-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          {/* Bar 2 (Sky Blue) */}
          <linearGradient id="iso-bar2-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          {/* Bar 3 (Indigo) */}
          <linearGradient id="iso-bar3-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          {/* Bar 4 (Purple) */}
          <linearGradient id="iso-bar4-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>

          {/* Neon Green Arrow Gradient */}
          <linearGradient id="iso-arrow-neon" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Gold Coin Gradients */}
          <linearGradient id="iso-gold-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="iso-gold-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* Floating frosted glass tile 1 (Top right) */}
        <rect
          x="54"
          y="12"
          width="20"
          height="20"
          rx="5"
          transform="rotate(-10 64 22)"
          fill="rgba(255,255,255,0.45)"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.2"
        />

        {/* Floating frosted glass tile 2 (Top left) */}
        <rect
          x="18"
          y="18"
          width="15"
          height="15"
          rx="4"
          transform="rotate(12 25 25)"
          fill="rgba(255,255,255,0.35)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1"
        />

        {/* 3D Glass Device Screen (Upright Back Plate) */}
        <path
          d="M 18 36 Q 16 33 20 31 L 64 16 Q 68 15 71 18 L 71 60 Q 71 63 68 65 L 24 80 Q 20 81 18 78 Z"
          fill="url(#iso-glass-screen)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.5"
        />

        {/* 3D Glass Device Base Platform Floor */}
        <path
          d="M 14 74 Q 12 76 16 78 L 52 96 Q 55 98 59 96 L 94 78 Q 98 76 95 74 L 59 56 Q 56 54 52 56 Z"
          fill="url(#iso-glass-floor)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
        />
        {/* Base 3D Thickness Edge */}
        <path
          d="M 14 74 L 14 79 Q 12 81 16 83 L 52 101 Q 55 103 59 101 L 94 83 Q 98 81 94 79 L 94 74 L 59 96 Q 55 98 52 96 Z"
          fill="url(#iso-glass-edge)"
        />

        {/* Bar 1 (Cyan - Shortest) */}
        <g>
          {/* Front */}
          <rect x="29" y="58" width="7" height="19" rx="1" fill="url(#iso-bar1-front)" />
          {/* Right side facet */}
          <path d="M 36 58 L 40 54 L 40 73 L 36 77 Z" fill="#0369a1" />
          {/* Top face */}
          <path d="M 29 58 L 33 54 L 40 54 L 36 58 Z" fill="#67e8f9" />
        </g>

        {/* Bar 2 (Sky Blue) */}
        <g>
          {/* Front */}
          <rect x="39" y="48" width="7" height="29" rx="1" fill="url(#iso-bar2-front)" />
          {/* Right side facet */}
          <path d="M 46 48 L 50 44 L 50 73 L 46 77 Z" fill="#1d4ed8" />
          {/* Top face */}
          <path d="M 39 48 L 43 44 L 50 44 L 46 48 Z" fill="#93c5fd" />
        </g>

        {/* Bar 3 (Indigo) */}
        <g>
          {/* Front */}
          <rect x="49" y="38" width="7" height="39" rx="1" fill="url(#iso-bar3-front)" />
          {/* Right side facet */}
          <path d="M 56 38 L 60 34 L 60 73 L 56 77 Z" fill="#4338ca" />
          {/* Top face */}
          <path d="M 49 38 L 53 34 L 60 34 L 56 38 Z" fill="#a5b4fc" />
        </g>

        {/* Bar 4 (Purple - Tallest) */}
        <g>
          {/* Front */}
          <rect x="59" y="28" width="7" height="49" rx="1" fill="url(#iso-bar4-front)" />
          {/* Right side facet */}
          <path d="M 66 28 L 70 24 L 70 73 L 66 77 Z" fill="#6b21a8" />
          {/* Top face */}
          <path d="M 59 28 L 63 24 L 70 24 L 66 28 Z" fill="#e9d5ff" />
        </g>

        {/* Glowing Neon Green Curved Trajectory Arrow */}
        <path
          d="M 22 72 Q 40 64 54 44 T 73 18"
          fill="none"
          stroke="url(#iso-arrow-neon)"
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="drop-shadow(0 2px 5px rgba(16,185,129,0.7))"
        />
        {/* Neon Green Arrowhead */}
        <path
          d="M 68 14 L 77 16 L 73 25 Z"
          fill="#10b981"
          stroke="#059669"
          strokeWidth="0.8"
          filter="drop-shadow(0 2px 4px rgba(16,185,129,0.8))"
        />

        {/* 3D Shiny Gold Coin in Foreground */}
        <g filter="drop-shadow(0 4px 6px rgba(180,83,9,0.3))">
          {/* Lower Coin base thickness */}
          <ellipse cx="70" cy="85" rx="13" ry="8" fill="#78350f" />
          <ellipse cx="70" cy="83" rx="13" ry="8" fill="url(#iso-gold-rim)" />
          {/* Top Coin */}
          <ellipse cx="70" cy="78" rx="13" ry="8" fill="#78350f" />
          <ellipse cx="70" cy="76" rx="13" ry="8" fill="url(#iso-gold-rim)" stroke="#fef08a" strokeWidth="0.8" />
          <ellipse cx="70" cy="76" rx="10.5" ry="6.2" fill="url(#iso-gold-face)" />
          <text
            x="70"
            y="79"
            textAnchor="middle"
            fill="#78350f"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            $
          </text>
        </g>
      </svg>
    </div>
  )
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
        'relative overflow-hidden rounded-[30px] sm:rounded-[34px] border border-white/80 dark:border-slate-800/80 bg-gradient-to-r from-white/95 via-[#f8faff]/95 to-[#eff6ff]/90 dark:from-[#0b1120]/95 dark:via-[#0f172a]/95 dark:to-[#1e1b4b]/85 px-5 py-4 sm:px-7 sm:py-5 shadow-[0_12px_36px_-12px_rgba(99,102,241,0.18)] dark:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.6)] select-none backdrop-blur-xl transition-all duration-300',
        className
      )}
    >
      {/* 1. Left Organic Purple/Magenta into Indigo Fluid Wave Background */}
      <div className="absolute -left-12 -top-10 -bottom-10 w-44 rounded-full bg-gradient-to-br from-purple-500/80 via-indigo-600/70 to-blue-600/60 blur-xl opacity-75 dark:opacity-60 pointer-events-none" />

      {/* 2. Bottom Smooth Cyan/Blue Wave Ribbon */}
      <svg
        className="absolute left-0 bottom-0 w-full h-10 sm:h-12 pointer-events-none overflow-hidden"
        preserveAspectRatio="none"
        viewBox="0 0 1000 60"
      >
        <defs>
          <linearGradient id="hero-bottom-wave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="20%" stopColor="#3b82f6" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M 0,25 Q 160,55 360,30 T 780,42 T 1000,28 L 1000,60 L 0,60 Z"
          fill="url(#hero-bottom-wave)"
        />
      </svg>

      {/* 3. Real Candlestick Chart (Alternating Green & Red with Glowing Trajectory) */}
      <svg
        className="absolute right-0 top-0 bottom-0 h-full w-3/5 sm:w-1/2 lg:w-[52%] pointer-events-none overflow-visible"
        viewBox="0 0 520 130"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Luminous Trendline Slope Glow */}
          <linearGradient id="candlestick-glow-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>

          {/* Candle Green Gradient */}
          <linearGradient id="candle-green-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Candle Red Gradient */}
          <linearGradient id="candle-red-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        {/* Glow fill underneath candles */}
        <path
          d="M 20,110 Q 140,105 250,70 T 475,15 L 475,130 L 20,130 Z"
          fill="url(#candlestick-glow-area)"
        />

        {/* Candle 1 (Red dip) */}
        <line x1="30" y1="82" x2="30" y2="114" stroke="#ef4444" strokeWidth="1.2" />
        <rect x="27" y="88" width="6" height="18" rx="1" fill="url(#candle-red-grad)" />

        {/* Candle 2 (Red lower wick) */}
        <line x1="55" y1="88" x2="55" y2="120" stroke="#ef4444" strokeWidth="1.2" />
        <rect x="52" y="94" width="6" height="16" rx="1" fill="url(#candle-red-grad)" />

        {/* Candle 3 (Green bounce) */}
        <line x1="80" y1="68" x2="80" y2="105" stroke="#10b981" strokeWidth="1.2" />
        <rect x="77" y="74" width="6" height="22" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 4 (Green continuation) */}
        <line x1="105" y1="58" x2="105" y2="92" stroke="#10b981" strokeWidth="1.2" />
        <rect x="102" y="64" width="6" height="20" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 5 (Red pullback) */}
        <line x1="130" y1="66" x2="130" y2="98" stroke="#ef4444" strokeWidth="1.2" />
        <rect x="127" y="72" width="6" height="18" rx="1" fill="url(#candle-red-grad)" />

        {/* Candle 6 (Green impulse) */}
        <line x1="155" y1="46" x2="155" y2="84" stroke="#10b981" strokeWidth="1.2" />
        <rect x="152" y="52" width="6" height="24" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 7 (Green higher high) */}
        <line x1="180" y1="38" x2="180" y2="76" stroke="#10b981" strokeWidth="1.2" />
        <rect x="177" y="44" width="6" height="24" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 8 (Red consolidation) */}
        <line x1="205" y1="48" x2="205" y2="80" stroke="#ef4444" strokeWidth="1.2" />
        <rect x="202" y="54" width="6" height="18" rx="1" fill="url(#candle-red-grad)" />

        {/* Candle 9 (Red retest) */}
        <line x1="230" y1="54" x2="230" y2="86" stroke="#ef4444" strokeWidth="1.2" />
        <rect x="227" y="60" width="6" height="18" rx="1" fill="url(#candle-red-grad)" />

        {/* Candle 10 (Green recovery) */}
        <line x1="255" y1="34" x2="255" y2="68" stroke="#10b981" strokeWidth="1.2" />
        <rect x="252" y="40" width="6" height="22" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 11 (Green breakout) */}
        <line x1="280" y1="26" x2="280" y2="62" stroke="#10b981" strokeWidth="1.2" />
        <rect x="277" y="32" width="6" height="24" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 12 (Red pause) */}
        <line x1="305" y1="36" x2="305" y2="66" stroke="#ef4444" strokeWidth="1.2" />
        <rect x="302" y="42" width="6" height="18" rx="1" fill="url(#candle-red-grad)" />

        {/* Candle 13 (Green bull thrust) */}
        <line x1="330" y1="18" x2="330" y2="54" stroke="#10b981" strokeWidth="1.2" />
        <rect x="327" y="24" width="6" height="24" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 14 (Green continuation) */}
        <line x1="355" y1="12" x2="355" y2="48" stroke="#10b981" strokeWidth="1.2" />
        <rect x="352" y="18" width="6" height="24" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 15 (Red shallow pause) */}
        <line x1="380" y1="20" x2="380" y2="52" stroke="#ef4444" strokeWidth="1.2" />
        <rect x="377" y="26" width="6" height="18" rx="1" fill="url(#candle-red-grad)" />

        {/* Candle 16 (Green apex climb) */}
        <line x1="405" y1="6" x2="405" y2="42" stroke="#10b981" strokeWidth="1.2" />
        <rect x="402" y="12" width="6" height="24" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 17 (Green bull expansion) */}
        <line x1="430" y1="0" x2="430" y2="36" stroke="#10b981" strokeWidth="1.2" />
        <rect x="427" y="6" width="6" height="24" rx="1" fill="url(#candle-green-grad)" />

        {/* Candle 18 (Green peak) */}
        <line x1="455" y1="-4" x2="455" y2="30" stroke="#10b981" strokeWidth="1.2" />
        <rect x="452" y="2" width="6" height="22" rx="1" fill="url(#candle-green-grad)" />

        {/* Glowing Green Trendline Undulating Beneath Candlesticks */}
        <path
          d="M 20,110 Q 140,102 240,68 T 465,12"
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          filter="drop-shadow(0 2px 6px rgba(16,185,129,0.5))"
        />

        {/* Soaring 3D Trend Arrow Head at Top Right Peak */}
        <path
          d="M 458,16 L 476,4 L 468,24 L 463,18 L 452,28 L 447,23 L 458,13 Z"
          fill="#00e676"
          stroke="#00c853"
          strokeWidth="1.5"
          filter="drop-shadow(0 3px 8px rgba(0, 230, 118, 0.7))"
        />
      </svg>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: 3D Isometric Platform Graphic + Title + Subtitle + Mini Gradient Pill */}
        <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
          <IsometricHeroBadge />

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0f172a] dark:text-white font-sans truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-300 mt-0.5 max-w-xl font-medium leading-relaxed">
              {subtitle}
            </p>
            {/* Sleek Mini Gradient Capsule Accent Bar */}
            <div className="mt-2 h-1.5 w-24 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 shadow-xs" />
          </div>
        </div>

        {/* Middle Content (Tabs / Buttons / Scope filters) */}
        {middleContent && (
          <div className="flex items-center justify-center shrink-0">
            {middleContent}
          </div>
        )}

        {/* Right Side: Optional Children + Floating Quote Capsule + Far Right 3D Orb Button */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
          {children}

          {/* Floating Quote Capsule */}
          {quote && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2 border border-slate-200/80 dark:border-slate-700/80 shadow-md shadow-indigo-500/10">
              <span className="text-[#6366f1] text-base font-serif font-black mr-0.5">“</span>
              <span className="text-xs sm:text-[13px] font-semibold italic text-slate-800 dark:text-slate-100 tracking-tight">
                {quote}
              </span>
            </div>
          )}

          {/* Far Right 3D Orb Action Button */}
          <div className="p-1 rounded-full bg-purple-100/60 dark:bg-purple-950/40 ring-4 ring-purple-200/50 dark:ring-purple-900/40 shadow-xl shadow-purple-500/25 shrink-0">
            <div className="h-11 w-11 sm:h-13 sm:w-13 rounded-full bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#8b5cf6] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 shadow-inner">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
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
    </div>
  )
}
