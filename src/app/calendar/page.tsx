'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              TRADING CALENDAR
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily realized P&L heatmap and execution calendar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono font-bold text-sm text-foreground px-2 min-w-[130px] text-center">
              {monthName}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border">
              {calendarDays.map((item, idx) => {
                if (!item) {
                  return <div key={`empty-${idx}`} className="h-28 bg-muted/10 p-2" />
                }

                const dayData = dailyDataMap.get(item.dateStr)
                const hasTrades = !!dayData && dayData.count > 0
                const isPositive = hasTrades && dayData.netPnl > 0
                const isNegative = hasTrades && dayData.netPnl < 0

                return (
                  <div
                    key={item.dateStr}
                    className={`h-28 p-2 flex flex-col justify-between transition-colors ${
                      hasTrades
                        ? isPositive
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50'
                          : 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {item.day}
                      </span>
                      {hasTrades && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {dayData.count} trades
                        </span>
                      )}
                    </div>

                    {hasTrades ? (
                      <div className="space-y-0.5 text-right">
                        <span
                          className={`font-mono text-xs font-bold block ${
                            isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-foreground'
                          }`}
                        >
                          {formatCurrency(dayData.netPnl, currency, true)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {dayData.wins}W / {dayData.losses}L
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground/30 italic text-center">—</div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

