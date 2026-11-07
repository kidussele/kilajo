'use client'

import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { EquityPoint } from '@/types/trading'
import { formatCurrency, formatDate } from '@/lib/utils'

interface EquityChartProps {
  data: EquityPoint[]
  currency?: string
}

export function EquityChart({ data, currency = 'USD' }: EquityChartProps) {
  if (!data || data.length <= 1) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/10">
        <p className="text-sm font-medium">No performance curve available</p>
        <p className="text-xs mt-1">Log or import closed trades to generate your dynamic balance curve.</p>
      </div>
    )
  }

  const isProfitable = data[data.length - 1].cumulativePnl >= 0

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isProfitable ? '#10b981' : '#ef4444'}
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor={isProfitable ? '#10b981' : '#ef4444'}
                stopOpacity={0.0}
              />
            </linearGradient>
          </defs>
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
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as EquityPoint
                return (
                  <div className="rounded-lg border bg-popover p-3 shadow-md text-xs font-sans space-y-1">
                    <p className="font-semibold text-foreground">
                      Trade #{item.tradeNumber} • {item.symbol}
                    </p>
                    <p className="text-muted-foreground">{formatDate(item.date)}</p>
                    <div className="border-t pt-1 space-y-0.5">
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Account Balance:</span>
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(item.balance, currency)}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Trade P&L:</span>
                        <span
                          className={`font-mono font-bold ${
                            item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(item.netPnl, currency, true)}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Drawdown:</span>
                        <span className="font-mono text-red-500">
                          -{formatCurrency(item.drawdown, currency)} ({item.drawdownPct}%)
                        </span>
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={isProfitable ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#equityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
