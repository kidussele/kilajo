'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { buildCategoryBreakdown } from '@/lib/calculations/financial'
import {
  Trophy,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Scale,
  BarChart3,
  PieChart as PieIcon,
  Brain,
  ShieldCheck,
  LineChart,
  Calendar,
  ArrowUpRight,
  ShoppingCart,
  FileText,
  ChevronDown,
} from 'lucide-react'

export default function AnalyticsPage() {
  const { filteredTrades, metrics, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [activeTab, setActiveTab] = useState<'performance' | 'psychology' | 'risk'>('performance')
  const [activeTimeframe, setActiveTimeframe] = useState('1M')

  // Breakdown calculations
  const instrumentBreakdown = useMemo(() => {
    return buildCategoryBreakdown(filteredTrades, (t) => t.symbol)
  }, [filteredTrades])

  const directionBreakdown = useMemo(() => {
    const buyTrades = filteredTrades.filter((t) => t.direction === 'BUY')
    const sellTrades = filteredTrades.filter((t) => t.direction === 'SELL')
    const total = filteredTrades.length || 1

    return {
      buyCount: buyTrades.length,
      buyPct: ((buyTrades.length / total) * 100).toFixed(2),
      sellCount: sellTrades.length,
      sellPct: ((sellTrades.length / total) * 100).toFixed(2),
    }
  }, [filteredTrades])

  // Weekday distribution
  const weekdayStats = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const counts: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
    filteredTrades.forEach((t) => {
      const d = new Date(t.exit_time || t.entry_time)
      const dayIdx = d.getDay() // 0 = Sun
      const dayName = days[dayIdx === 0 ? 6 : dayIdx - 1]
      if (counts[dayName] !== undefined) counts[dayName]++
    })
    const total = filteredTrades.length || 1
    return days.map((day) => ({
      day,
      pct: Math.round((counts[day] / total) * 100),
    }))
  }, [filteredTrades])

  const winCount = metrics.winningTrades
  const lossCount = metrics.losingTrades
  const totalClosed = winCount + lossCount
  const winPct = totalClosed > 0 ? ((winCount / totalClosed) * 100).toFixed(2) : '0.00'
  const lossPct = totalClosed > 0 ? ((lossCount / totalClosed) * 100).toFixed(2) : '0.00'

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="Analytics Center"
          subtitle="Deep statistical edge analysis, risk distribution, and behavioral patterns"
          iconElement={
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-white shadow-md shadow-emerald-900/20">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="14" width="3.5" height="7" rx="1.5" />
                <rect x="8.5" y="10" width="3.5" height="11" rx="1.5" />
                <rect x="14" y="6" width="3.5" height="15" rx="1.5" />
                <rect x="19.5" y="2" width="3.5" height="19" rx="1.5" />
              </svg>
            </div>
          }
          middleContent={
            <div className="flex items-center gap-1.5 rounded-full bg-white/70 p-1 border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => setActiveTab('performance')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'performance'
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Performance</span>
              </button>
              <button
                onClick={() => setActiveTab('psychology')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'psychology'
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Brain className="h-3.5 w-3.5" />
                <span>Psychology</span>
              </button>
              <button
                onClick={() => setActiveTab('risk')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'risk'
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Risk & Drawdown</span>
              </button>
            </div>
          }
          quote="Know your numbers, master your probability."
        />

        {/* 2. 6 Metric Cards Matching Screenshot 3 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
            icon={Trophy}
            color="emerald"
          />

          <MetricCard
            title="Profit Factor"
            value={metrics.profitFactor > 0 ? metrics.profitFactor.toString() : '0'}
            subtitle={metrics.profitFactor >= 1.5 ? 'Institutional' : 'Developing'}
            icon={TrendingUp}
            color="purple"
          />

          <MetricCard
            title="Expectancy"
            value={formatCurrency(metrics.expectancy, currency, true)}
            subtitle="Per trade executed"
            icon={DollarSign}
            color="teal"
          />

          <MetricCard
            title="Max Drawdown"
            value={`-${formatCurrency(metrics.maxDrawdownAmount, currency)}`}
            subtitle={`${metrics.maxDrawdownPercentage}%`}
            icon={ShieldAlert}
            color="rose"
          />

          <MetricCard
            title="Avg Win / Loss"
            value={metrics.averageLoss > 0 ? (metrics.averageWin / metrics.averageLoss).toFixed(2) : '--'}
            subtitle="Payoff ratio"
            icon={Scale}
            color="blue"
          />

          <MetricCard
            title="Total Volume"
            value={`${metrics.totalTrades} Trades`}
            subtitle="Closed executions"
            icon={BarChart3}
            color="purple"
          />
        </div>

        {/* 3. Middle Section: Net Performance by Session & Trade Distribution (2/3 and 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left (2/3): Net Performance by Session */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
            {/* Dark green header bar */}
            <div className="flex items-center justify-between bg-[#064e3b] text-white px-5 py-3.5">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-300 stroke-[2.2]" />
                <h3 className="font-bold text-xs sm:text-sm font-sans tracking-tight">
                  Net Performance by Session
                </h3>
              </div>

              {/* Timeframe selector pills */}
              <div className="flex items-center gap-1 rounded-lg bg-emerald-900/60 p-0.5 text-[10px] font-semibold text-emerald-200">
                {['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`rounded-md px-2 py-0.5 transition-all cursor-pointer ${
                      activeTimeframe === tf
                        ? 'bg-white text-[#064e3b] font-bold shadow-2xs'
                        : 'hover:text-white hover:bg-emerald-800/40'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative p-6 flex flex-col items-center justify-center min-h-[220px]">
              {/* Soft background line and axes */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-20">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$1.0k</span>
                  <div className="border-b border-dashed border-slate-300 flex-1 mx-2 mt-2" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$0.5k</span>
                  <div className="border-b border-dashed border-slate-300 flex-1 mx-2 mt-2" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$0</span>
                  <div className="border-b border-slate-300 flex-1 mx-2 mt-2" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span className="pl-6">Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>

              {/* Center Empty State */}
              <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner mb-3">
                  <BarChart3 className="h-6 w-6 stroke-[2.2]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  No performance data yet!
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                  Start trading to see your performance chart here.
                </p>
              </div>

              {/* Bottom Subtle Wave */}
              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-30">
                <svg className="w-full h-full text-emerald-200" viewBox="0 0 400 40" preserveAspectRatio="none">
                  <path d="M0,20 C100,35 250,5 400,25 L400,40 L0,40 Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right (1/3): Trade Distribution */}
          <div className="lg:col-span-1 rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
            {/* Dark green header bar */}
            <div className="flex items-center gap-2 bg-[#064e3b] text-white px-5 py-3.5">
              <PieIcon className="h-4 w-4 text-emerald-300 stroke-[2.2]" />
              <h3 className="font-bold text-xs sm:text-sm font-sans tracking-tight">
                Trade Distribution
              </h3>
            </div>

            {/* Circular Donut Graphic */}
            <div className="p-6 flex flex-col items-center justify-center flex-1">
              <div className="flex items-center justify-center gap-6">
                {/* Donut ring */}
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-slate-100"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {totalClosed > 0 && (
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${winPct}, 100`}
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-bold font-mono text-base text-slate-800">{totalClosed}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Trades</span>
                  </div>
                </div>

                {/* Legend on right */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-700">Win ({winCount})</span>
                    <span className="font-mono text-slate-400 text-[11px]">{winPct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-slate-700">Loss ({lossCount})</span>
                    <span className="font-mono text-slate-400 text-[11px]">{lossPct}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-slate-400">
                <span className="font-medium">No closed trades yet ℹ️</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Your trade distribution will appear here.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Detailed Breakdown by Symbol / Instrument */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden">
          {/* Dark green header bar */}
          <div className="flex items-center gap-2 bg-[#064e3b] text-white px-5 py-3.5">
            <BarChart3 className="h-4 w-4 text-emerald-300 stroke-[2.2]" />
            <h3 className="font-bold text-xs sm:text-sm font-sans tracking-tight">
              Detailed Breakdown by Symbol / Instrument
            </h3>
          </div>

          {/* Table Header (subtle gray bar) */}
          <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-xs font-bold text-slate-600">
            <span>Instrument</span>
            <span>Trades</span>
            <span>Win Rate</span>
            <span>Net P&L</span>
            <span>Profit Factor</span>
            <span className="text-right">Avg Trade P&L</span>
          </div>

          {/* Table Body / Empty State */}
          {instrumentBreakdown.length === 0 ? (
            <div className="relative p-12 flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
                <FileText className="h-6 w-6 stroke-[1.8]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No data available</h4>
              <p className="text-xs text-slate-400 mt-0.5">Trade some instruments to see the breakdown.</p>

              {/* Soft mint wave at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-25">
                <svg className="w-full h-full text-emerald-300" viewBox="0 0 600 40" preserveAspectRatio="none">
                  <path d="M0,25 C150,35 350,10 600,30 L600,40 L0,40 Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {instrumentBreakdown.map((row) => (
                <div key={row.category} className="grid grid-cols-6 px-5 py-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <span className="font-bold font-mono text-slate-900">{row.category}</span>
                  <span className="font-mono">{row.tradesCount}</span>
                  <span className="font-mono">{row.winRate}%</span>
                  <span className={`font-mono font-bold ${row.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(row.netPnl, currency, true)}
                  </span>
                  <span className="font-mono">{row.profitFactor}</span>
                  <span className="font-mono text-right">{formatCurrency(row.averagePnl, currency, true)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Bottom Row (2 Cards): Performance by Direction & Day of Week */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Performance by Direction (Buy vs. Sell) */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-200/80 transition-all duration-200 group">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-2xs group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-4 w-4 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 font-sans">
                  Performance by Direction (Buy vs. Sell)
                </h3>
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-all cursor-pointer group-hover:scale-110 shadow-2xs">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Buy Trades Box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 hover:shadow-2xs hover:bg-emerald-50/80 transition-all cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <ShoppingCart className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800">Buy Trades</span>
                  <span className="font-mono text-xs text-slate-500 font-medium">
                    {directionBreakdown.buyCount} Trades • {directionBreakdown.buyPct}%
                  </span>
                </div>
              </div>

              {/* Sell Trades Box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100/60 hover:shadow-2xs hover:bg-rose-50/80 transition-all cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <ShoppingCart className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800">Sell Trades</span>
                  <span className="font-mono text-xs text-slate-500 font-medium">
                    {directionBreakdown.sellCount} Trades • {directionBreakdown.sellPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Performance by Day of Week */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-200/80 transition-all duration-200 group">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-2xs group-hover:scale-110 transition-transform">
                  <Calendar className="h-4 w-4 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 font-sans">
                  Performance by Day of Week
                </h3>
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-all cursor-pointer group-hover:scale-110 shadow-2xs">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 py-4 text-center">
              {weekdayStats.map((item) => (
                <div key={item.day} className="rounded-xl bg-slate-50/80 p-2 border border-slate-100 hover:bg-emerald-50/60 transition-colors cursor-pointer">
                  <span className="block text-[11px] font-bold text-slate-600">{item.day}</span>
                  <span className="font-mono text-xs font-semibold text-slate-400">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
