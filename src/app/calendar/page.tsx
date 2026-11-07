'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { useTrading } from '@/context/trading-context'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  TrendingUp,
  Percent,
  Trophy,
  Clock,
  ShieldCheck,
  BarChart3,
  Target,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

export default function CalendarPage() {
  const router = useRouter()
  const { filteredTrades, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Aggregate trade metrics per day
  const dailyDataMap = useMemo(() => {
    const map = new Map<string, { netPnl: number; count: number; wins: number; losses: number; trades: any[] }>()

    filteredTrades.forEach((trade) => {
      if (trade.exit_time || trade.entry_time) {
        const dStr = (trade.exit_time || trade.entry_time).split('T')[0]
        const existing = map.get(dStr) || { netPnl: 0, count: 0, wins: 0, losses: 0, trades: [] }
        const net = Number(trade.net_pnl || 0)
        existing.netPnl += net
        existing.count++
        if (net > 0) existing.wins++
        if (net < 0) existing.losses++
        existing.trades.push(trade)
        map.set(dStr, existing)
      }
    })

    return map
  }, [filteredTrades])

  // Generate days in month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay() // 0 = Sunday

    const days: ({ day: number; dateStr: string; inMonth: boolean } | null)[] = []

    // Pad leading days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ day: d, dateStr, inMonth: true })
    }

    return days
  }, [year, month])

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Monthly summary metrics
  const monthMetrics = useMemo(() => {
    let netPnl = 0
    let tradingDays = 0
    let greenDays = 0
    let redDays = 0
    let bestDay = 0
    let worstDay = 0

    calendarDays.forEach((item) => {
      if (!item) return
      const d = dailyDataMap.get(item.dateStr)
      if (d && d.count > 0) {
        tradingDays++
        netPnl += d.netPnl
        if (d.netPnl > 0) greenDays++
        if (d.netPnl < 0) redDays++
        if (d.netPnl > bestDay) bestDay = d.netPnl
        if (d.netPnl < worstDay) worstDay = d.netPnl
      }
    })

    const winRate = tradingDays > 0 ? Math.round((greenDays / tradingDays) * 100) : 0

    return {
      netPnl,
      tradingDays,
      greenDays,
      redDays,
      winRate,
      bestDay,
      worstDay,
    }
  }, [calendarDays, dailyDataMap])

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="Trading Calendar"
          subtitle="Plan, execute and review your trades, and track your consistency."
          iconElement={
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-white shadow-md shadow-emerald-900/20">
              <Calendar className="h-7 w-7 text-white stroke-[2.2]" />
            </div>
          }
          middleContent={
            <div className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 shadow-2xs">
              <button onClick={prevMonth} className="text-slate-500 hover:text-slate-900">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Calendar className="h-3.5 w-3.5 text-emerald-700 stroke-[2.2]" />
                <span>{monthName}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 stroke-[2.5]" />
              </div>
              <button onClick={nextMonth} className="text-slate-500 hover:text-slate-900">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
          quote="Discipline today, Freedom tomorrow."
        />

        {/* 2. 6 Metric Cards Matching Screenshot 4 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            title="Monthly Net P&L"
            value={formatCurrency(monthMetrics.netPnl, currency, true)}
            subtitle="▲ +0.00% vs last month"
            trend={monthMetrics.netPnl >= 0 ? '▲ +0.00%' : '▼ 0.00%'}
            trendPositive={monthMetrics.netPnl >= 0}
            icon={TrendingUp}
            color="purple"
          />

          <MetricCard
            title="Trading Days"
            value={monthMetrics.tradingDays.toString()}
            subtitle="0% of 30 days"
            icon={CalendarDays}
            color="emerald"
          />

          <MetricCard
            title="Day Win Rate"
            value={`${monthMetrics.winRate}%`}
            subtitle="0W / 0L"
            icon={Percent}
            color="amber"
          />

          <MetricCard
            title="Best Day"
            value={formatCurrency(monthMetrics.bestDay, currency, true)}
            subtitle="Highest session return"
            icon={Trophy}
            color="blue"
          />

          <MetricCard
            title="Worst Day"
            value={formatCurrency(monthMetrics.worstDay, currency, true)}
            subtitle="Largest daily drawdown"
            icon={Clock}
            color="indigo"
          />

          <MetricCard
            title="Consistency"
            value="Normal"
            subtitle="On track to build habit"
            icon={ShieldCheck}
            color="teal"
          />
        </div>

        {/* 3. Main Calendar Card Matching Screenshot 4 */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs overflow-hidden">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-base font-bold text-slate-900 font-sans">
                {monthName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Win</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span>Loss</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span>Breakeven</span>
                </span>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => router.push('/journal')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-4 py-1.5 text-xs font-semibold shadow-xs transition-all hover:scale-105"
              >
                <BarChart3 className="h-3.5 w-3.5 stroke-[2.2]" />
                <span>View Details →</span>
              </button>
            </div>
          </div>

          {/* Weekday Labels (Soft mint background with dark green font) */}
          <div className="grid grid-cols-7 rounded-t-2xl bg-emerald-50/80 text-center text-xs font-bold text-[#064e3b] py-2.5 border border-emerald-100/80">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-x border-b border-slate-100">
            {calendarDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-24 bg-slate-50/20 p-2" />
              }

              const dayData = dailyDataMap.get(item.dateStr)
              const hasTrades = !!dayData && dayData.count > 0
              const isPositive = hasTrades && dayData.netPnl > 0
              const isNegative = hasTrades && dayData.netPnl < 0
              const isFirstDay = item.day === 1

              return (
                <div
                  key={item.dateStr}
                  className={`h-24 p-2 flex flex-col justify-between transition-colors ${
                    isFirstDay ? 'border-2 border-emerald-500 rounded-sm' : ''
                  } ${
                    hasTrades
                      ? isPositive
                        ? 'bg-emerald-50/60 hover:bg-emerald-100/50'
                        : 'bg-rose-50/60 hover:bg-rose-100/50'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {item.day}
                  </span>

                  {hasTrades ? (
                    <div>
                      <div
                        className={`font-mono text-xs font-extrabold ${
                          isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-700' : 'text-slate-600'
                        }`}
                      >
                        {formatCurrency(dayData.netPnl, currency, true)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {dayData.count} {dayData.count === 1 ? 'trade' : 'trades'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-slate-300 font-medium pb-1">
                      <Calendar className="h-3 w-3 text-slate-300" />
                      <span>No activity</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Bottom Callout Banner Matching Screenshot 4 */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-100/30 p-5 shadow-xs flex items-center justify-between gap-4">
          {/* Subtle Candlestick Background */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-around px-24">
            <div className="h-8 w-2 bg-emerald-600 rounded-xs" />
            <div className="h-12 w-2 bg-emerald-600 rounded-xs" />
            <div className="h-10 w-2 bg-emerald-600 rounded-xs" />
            <div className="h-14 w-2 bg-emerald-600 rounded-xs" />
            <div className="h-16 w-2 bg-emerald-600 rounded-xs" />
          </div>

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-emerald-800/80 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Target className="h-5 w-5 text-emerald-800 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-sans">
                Stay Consistent!
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Log your trades daily to unlock deeper insights and achieve your goals.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/journal')}
            className="relative z-10 inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105 shrink-0"
          >
            <span>Start Trading</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
