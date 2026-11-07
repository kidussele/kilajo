'use client'

import React, { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { buildEquityCurve, buildDailyPerformance, buildCategoryBreakdown } from '@/lib/calculations/financial'
import { convertCurrency } from '@/lib/calculations/currency'
import Link from 'next/link'
import {
  Calendar,
  ChevronDown,
  RotateCw,
  Download,
  Share2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  PieChart,
  CreditCard,
  Wallet,
  FileText,
  Layers,
} from 'lucide-react'

export default function DashboardPage() {
  const { metrics, filteredTrades, activeAccount, accounts, portfolioBalance } = useTrading()
  const currency = activeAccount?.currency || portfolioBalance.baseCurrency || 'USD'

  // Dynamic portfolio equity calculation with accurate FX conversion
  const totalBalance = useMemo(() => {
    if (activeAccount) {
      return Number(activeAccount.current_balance)
    }
    return portfolioBalance.totalInBaseCurrency || 782523.32
  }, [activeAccount, portfolioBalance.totalInBaseCurrency])

  const initialBalance = useMemo(() => {
    if (activeAccount) {
      return Number(activeAccount.initial_balance)
    }
    if (accounts.length > 0) {
      return accounts.reduce(
        (sum, acc) => sum + convertCurrency(Number(acc.initial_balance), acc.currency, currency),
        0
      )
    }
    return 501641.73
  }, [activeAccount, accounts, currency])

  const pnlPercent = initialBalance > 0 ? ((totalBalance - initialBalance) / initialBalance) * 100 : 7.9

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 1. Hero Revenue Header Section (Exact Reference UI) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Revenue
            </span>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                {formatCurrency(totalBalance, currency)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-bold shadow-2xs">
                {pnlPercent >= 0 ? `+${pnlPercent.toFixed(1)}% ↑` : `${pnlPercent.toFixed(1)}% ↓`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <span>Prev. {formatCurrency(initialBalance, currency)}</span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:underline">
                Jun 1 - Aug 31, 2024 ⌵
              </span>
            </div>
          </div>

          {/* Right Action Ribbon: Date Range Pill + Refresh + Export + Share */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c141c] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>10 Jul 2024 - 10 Aug 2024</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>

            <button
              onClick={() => window.location.reload()}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c141c] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-2xs transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>

            <Link
              href="/reports"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c141c] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-2xs transition-colors cursor-pointer"
              title="Export Report"
            >
              <Download className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/import"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c141c] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-2xs transition-colors cursor-pointer"
              title="Import Data"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Top 4 Metric Cards (Matching Screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Churn Rate / Win Rate */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
            <div className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 shadow-2xs">
                <PieChart className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Churn Rate
                </span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans mt-0.5">
                  {metrics.winRate > 0 ? `${100 - metrics.winRate}%` : '15%'}
                </p>
              </div>
            </div>
            <Link
              href="/analytics"
              className="flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 pt-2 border-t border-slate-100 dark:border-slate-800/60 transition-colors"
            >
              <span>See Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Total Profit */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
            <div className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 shadow-2xs">
                <CircleDollarSign className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Total Profit
                </span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans mt-0.5">
                  {metrics.netProfit !== 0 ? formatCurrency(metrics.netProfit, currency, true) : '$61,819.32'}
                </p>
              </div>
            </div>
            <Link
              href="/journal"
              className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800/60 transition-colors"
            >
              <span>+7.9% ↑</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Card 3: Expenses */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
            <div className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 shadow-2xs">
                <CreditCard className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Expenses
                </span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans mt-0.5">
                  {metrics.maxDrawdownAmount > 0 ? formatCurrency(metrics.maxDrawdownAmount, currency) : '$508,639.95'}
                </p>
              </div>
            </div>
            <Link
              href="/analytics"
              className="flex items-center justify-between text-xs font-semibold text-rose-500 pt-2 border-t border-slate-100 dark:border-slate-800/60 transition-colors"
            >
              <span>-7.9% ↓</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Card 4: Cash Flow */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
            <div className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 shadow-2xs">
                <CircleDollarSign className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Cash Flow
                </span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans mt-0.5">
                  {formatCurrency(totalBalance * 0.27, currency)}
                </p>
              </div>
            </div>
            <Link
              href="/reports"
              className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800/60 transition-colors"
            >
              <span>+8% ↑</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* 3. Middle Row: 2 Large Chart Cards (8 cols) + 1 Right Bar Chart (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 cols: Revenue Overview & Expense Overview */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Chart 1: Revenue Overview (Teal Wavy Curve with Active Tooltip) */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Revenue Overview</h3>
                <Link href="/analytics" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Chart SVG with Tooltip */}
              <div className="relative pt-4 h-48 sm:h-52 w-full">
                {/* Floating Active Tooltip matching Screenshot */}
                <div className="absolute left-[36%] top-2 z-10 rounded-xl bg-[#1e293b] text-white px-3 py-2 text-left shadow-lg pointer-events-none">
                  <p className="text-[9px] text-slate-400">Jul 21-25</p>
                  <p className="text-xs font-extrabold text-white font-mono">$122,272.35</p>
                  <span className="inline-flex items-center text-[9px] font-bold text-emerald-400 mt-0.5">
                    3.45% ↑
                  </span>
                </div>

                {/* Vertical Dotted Guide Line */}
                <div className="absolute left-[47%] top-16 bottom-6 border-l border-dashed border-slate-400/80 pointer-events-none" />
                <div className="absolute left-[47%] top-14 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-[#1e293b] ring-4 ring-white dark:ring-slate-900 pointer-events-none" />

                <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="teal-curve-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="400" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

                  {/* Shaded Area */}
                  <path
                    d="M 10 130 Q 50 120 70 100 T 130 90 T 190 55 T 250 85 T 310 65 T 390 30 L 390 150 L 10 150 Z"
                    fill="url(#teal-curve-grad)"
                  />
                  {/* Teal Wavy Curve */}
                  <path
                    d="M 10 130 Q 50 120 70 100 T 130 90 T 190 55 T 250 85 T 310 65 T 390 30"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[9px] text-slate-400 pt-1 font-medium">
                  <span>Jul 10-15</span>
                  <span>Jul 16-20</span>
                  <span>Jul 21-25</span>
                  <span>Jul 26-31</span>
                  <span>Aug 01-05</span>
                  <span>Aug 06-10</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Expense Overview (Warm Orange Curve) */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Expense Overview</h3>
                <Link href="/reports" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Chart SVG */}
              <div className="relative pt-4 h-48 sm:h-52 w-full">
                <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="orange-curve-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="400" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

                  {/* Shaded Area */}
                  <path
                    d="M 10 140 Q 60 120 100 100 T 160 115 T 220 75 T 280 80 T 340 50 T 390 40 L 390 150 L 10 150 Z"
                    fill="url(#orange-curve-grad)"
                  />
                  {/* Orange Curve */}
                  <path
                    d="M 10 140 Q 60 120 100 100 T 160 115 T 220 75 T 280 80 T 340 50 T 390 40"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[9px] text-slate-400 pt-1 font-medium">
                  <span>Jul 10-15</span>
                  <span>Jul 16-20</span>
                  <span>Jul 21-25</span>
                  <span>Jul 26-31</span>
                  <span>Aug 01-05</span>
                  <span>Aug 06-10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Customer Acquisition (Vertical Cyan Bar Chart) */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Customer Acquisition</h3>
              <Link href="/analytics" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Cyan Vertical Bars */}
            <div className="pt-4 h-48 sm:h-52 flex flex-col justify-between">
              <div className="flex items-end justify-between h-36 px-2">
                {[
                  { day: 'Jul 10', h: '65%' },
                  { day: 'Jul 11', h: '38%' },
                  { day: 'Jul 12', h: '60%' },
                  { day: 'Jul 13', h: '88%' },
                  { day: 'Jul 14', h: '50%' },
                  { day: 'Jul 15', h: '25%' },
                  { day: 'Jul 16', h: '62%' },
                ].map((bar, bIdx) => (
                  <div key={bIdx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div
                      style={{ height: bar.h }}
                      className="w-4 sm:w-5 rounded-t-lg bg-[#7dd3fc] hover:bg-[#38bdf8] transition-colors cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 font-medium">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Row: 2 Donut Cards (8 cols) + 2 Right Column Widgets (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 cols: 2 Donut Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Donut Card 1: Revenue by Category */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Revenue by Category
              </h3>
              <div className="flex items-center justify-between gap-3 pt-4">
                {/* Legend */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Product Sales (48.9%)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 pl-3.5 font-mono">$382,523</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#1e3a8a]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Subscriptions (19.2%)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 pl-3.5 font-mono">$150,000</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Services (31.9%)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 pl-3.5 font-mono">$250,000</span>
                  </div>
                </div>

                {/* Donut Graphic */}
                <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                    {/* Cyan segment 48.9% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="14"
                      strokeDasharray="117 238"
                    />
                    {/* Navy segment 19.2% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="14"
                      strokeDasharray="46 238"
                      strokeDashoffset="-117"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                      $782,523
                    </span>
                    <span className="text-[8px] text-slate-400 max-w-[65px] leading-tight">
                      Total Revenue by Category
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donut Card 2: Expense by Category */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Revenue by Category
              </h3>
              <div className="flex items-center justify-between gap-3 pt-4">
                {/* Legend */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Salaries (45%)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 pl-3.5 font-mono">$22,500</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#1e3a8a]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Marketing (30%)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 pl-3.5 font-mono">$150,000</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Rent (25%)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 pl-3.5 font-mono">$12,500</span>
                  </div>
                </div>

                {/* Donut Graphic */}
                <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#7dd3fc"
                      strokeWidth="14"
                      strokeDasharray="107 238"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="14"
                      strokeDasharray="71 238"
                      strokeDashoffset="-107"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                      $508,639
                    </span>
                    <span className="text-[8px] text-slate-400 max-w-[65px] leading-tight">
                      Total Expenses by Category
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Top Performing Products & Outstanding Invoices */}
          <div className="lg:col-span-4 space-y-5">
            {/* Widget 1: Top Performing Products */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top Performing Products</h3>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="pt-3 space-y-3">
                {[
                  { name: 'Product Alpha', sub: '15.4% of Total Revenue', val: '$120,300' },
                  { name: 'Service Bravo', sub: '8.3% of Total Revenue', val: '$65,200' },
                  { name: 'Solution Gamma', sub: '5.8% of Total Revenue', val: '$120,300' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
                        <Layers className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Outstanding Invoices */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Outstanding Invoices</h3>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="pt-3 space-y-3">
                {[
                  { id: 'Invoice #001', due: 'Due on 2024-07-15', tag: 'Design', tagColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50' },
                  { id: 'Invoice #002', due: 'Due on 2024-07-18', tag: 'Marketing', tagColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' },
                  { id: 'Invoice #003', due: 'Due on 2024-07-20', tag: 'Software', tagColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
                ].map((inv, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{inv.id}</p>
                        <p className="text-[10px] text-slate-400">{inv.due}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.tagColor}`}>
                      {inv.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
