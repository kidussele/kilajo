'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { useTrading } from '@/context/trading-context'
import { formatCurrency } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Flame,
} from 'lucide-react'

export default function CalendarPage() {
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
      <div className="space-y-5">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Trading Calendar"
          subtitle="Daily realized P&L heatmap, session breakdown, and trading consistency"
          icon={CalendarDays}
          quote="Master consistency day by day."
        >
          {/* Month Selector Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 p-1 shadow-2xs">
            <button
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-xs sm:text-sm text-slate-900 px-3 min-w-[120px] text-center font-sans">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </PageHeroBanner>

        {/* Monthly Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="Monthly Net P&L"
            value={formatCurrency(monthMetrics.netPnl, currency, true)}
            subtitle={monthMetrics.netPnl >= 0 ? 'Profitable Month' : 'Drawdown Month'}
            trend={monthMetrics.netPnl >= 0 ? '▲ Profit' : '▼ Loss'}
            trendPositive={monthMetrics.netPnl >= 0}
            icon={TrendingUp}
            color="purple"
          />
          <MetricCard
            title="Trading Days"
            value={monthMetrics.tradingDays.toString()}
            subtitle={`${monthMetrics.greenDays}G / ${monthMetrics.redDays}R`}
            icon={CalendarDays}
            color="emerald"
          />
          <MetricCard
            title="Day Win Rate"
            value={`${monthMetrics.winRate}%`}
            subtitle="Profitable days %"
            icon={CheckCircle2}
            color="amber"
          />
          <MetricCard
            title="Best Day"
            value={formatCurrency(monthMetrics.bestDay, currency, true)}
            subtitle="Highest session return"
            icon={Award}
            color="blue"
          />
          <MetricCard
            title="Worst Day"
            value={formatCurrency(monthMetrics.worstDay, currency, true)}
            subtitle="Largest daily drawdown"
            icon={AlertCircle}
            color="indigo"
          />
          <MetricCard
            title="Consistency"
            value={monthMetrics.greenDays > monthMetrics.redDays ? 'High' : 'Normal'}
            subtitle="Green vs Red Ratio"
            icon={Flame}
            color="teal"
          />
        </div>

        {/* Calendar Grid Container */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-center text-xs font-bold text-slate-500 py-3">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-28 bg-slate-50/20 p-2" />
              }

              const dayData = dailyDataMap.get(item.dateStr)
              const hasTrades = !!dayData && dayData.count > 0
              const isPositive = hasTrades && dayData.netPnl > 0
              const isNegative = hasTrades && dayData.netPnl < 0

              return (
                <div
                  key={item.dateStr}
                  className={`h-28 p-2.5 flex flex-col justify-between transition-colors ${
                    hasTrades
                      ? isPositive
                        ? 'bg-emerald-50/50 hover:bg-emerald-100/50'
                        : 'bg-rose-50/50 hover:bg-rose-100/50'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {item.day}
                    </span>
                    {hasTrades && (
                      <span className="rounded-full bg-white/80 border border-slate-200/60 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 shadow-2xs">
                        {dayData.count} {dayData.count === 1 ? 'trade' : 'trades'}
                      </span>
                    )}
                  </div>

                  {hasTrades ? (
                    <div>
                      <div
                        className={`font-mono text-xs sm:text-sm font-extrabold flex items-center gap-0.5 ${
                          isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-700' : 'text-slate-600'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />
                        ) : isNegative ? (
                          <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />
                        ) : null}
                        <span>{formatCurrency(dayData.netPnl, currency, true)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {dayData.wins}W / {dayData.losses}L
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-300 font-medium italic">No activity</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
