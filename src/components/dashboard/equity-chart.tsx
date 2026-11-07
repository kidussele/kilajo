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
import { TrendingUp, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EquityChartProps {
  data: EquityPoint[]
  currency?: string
}

export function EquityChart({ data, currency = 'USD' }: EquityChartProps) {
  const router = useRouter()

  if (!data || data.length <= 1) {
    return (
      <div className="relative flex h-72 w-full flex-col items-center justify-center rounded-2xl overflow-hidden bg-slate-50/40 p-6 text-center select-none">
        {/* Subtle Background Axis Mock */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner mb-3">
            <TrendingUp className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-800 font-sans">
            No performance data yet!
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed font-medium">
            Start trading to see your equity curve here.
          </p>
          <button
            onClick={() => router.push('/journal')}
            className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all hover:scale-105"
          >
            <span>Start Trading</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => formatDate(val)}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
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
                  <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-lg text-xs font-sans space-y-1">
                    <p className="font-bold text-slate-800">
                      Trade #{item.tradeNumber} • {item.symbol}
                    </p>
                    <p className="text-slate-400">{formatDate(item.date)}</p>
                    <div className="border-t border-slate-100 pt-1 space-y-0.5">
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">Account Balance:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatCurrency(item.balance, currency)}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">Trade P&L:</span>
                        <span
                          className={`font-mono font-bold ${
                            item.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatCurrency(item.netPnl, currency, true)}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">Drawdown:</span>
                        <span className="font-mono text-rose-500 font-semibold">
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
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#equityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
