'use client'

import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts'
import { DailyPerformance } from '@/types/trading'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DailyPnlChartProps {
  data: DailyPerformance[]
  currency?: string
}

export function DailyPnlChart({ data, currency = 'USD' }: DailyPnlChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/10">
        <p className="text-sm font-medium">No daily activity recorded</p>
        <p className="text-xs mt-1">Trades will automatically populate daily performance analytics.</p>
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => formatDate(val)}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as DailyPerformance
                return (
                  <div className="rounded-lg border bg-popover p-3 shadow-md text-xs font-sans space-y-1">
                    <p className="font-semibold text-foreground">{formatDate(item.date)}</p>
                    <div className="border-t pt-1 space-y-0.5">
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Daily Net P&L:</span>
                        <span
                          className={`font-mono font-bold ${
                            item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(item.netPnl, currency, true)}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Trades Executed:</span>
                        <span className="font-mono text-foreground">{item.tradesCount}</span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className="font-mono text-foreground">{item.winRate}%</span>
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.netPnl >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
