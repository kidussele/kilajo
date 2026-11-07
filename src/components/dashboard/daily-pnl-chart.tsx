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
import { BarChart3, CalendarCheck, ChevronDown, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DailyPnlChartProps {
  data: DailyPerformance[]
  currency?: string
}

export function DailyPnlChart({ data, currency = 'USD' }: DailyPnlChartProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden select-none">
      {/* Top Forest Green Header Bar */}
      <div className="flex items-center justify-between bg-[#064e3b] text-white px-5 py-3.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-300 stroke-[2.2]" />
          <h3 className="font-bold text-xs sm:text-sm font-sans tracking-tight">
            Daily Realized P&L
          </h3>
        </div>

        <button className="flex items-center gap-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900/90 text-emerald-100 px-3 py-1 text-xs font-semibold border border-emerald-700/40 transition-colors">
          <span>This Month</span>
          <ChevronDown className="h-3 w-3 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 p-5 flex flex-col items-center justify-center min-h-[240px]">
        {/* Subtle Candlestick Background Silhouette */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-around px-4">
          <div className="h-24 w-4 bg-emerald-700 rounded-sm" />
          <div className="h-32 w-4 bg-emerald-700 rounded-sm" />
          <div className="h-20 w-4 bg-emerald-700 rounded-sm" />
          <div className="h-28 w-4 bg-emerald-700 rounded-sm" />
          <div className="h-36 w-4 bg-emerald-700 rounded-sm" />
        </div>

        {(!data || data.length === 0) ? (
          <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
              <CalendarCheck className="h-7 w-7 text-emerald-600 stroke-[2.2]" />
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ✓
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-800">
              No daily activity recorded
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed font-medium">
              Track your trades to see daily performance and statistics.
            </p>

            <button
              onClick={() => router.push('/journal')}
              className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105"
            >
              <span>View Journal</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                />
                <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as DailyPerformance
                      return (
                        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-lg text-xs font-sans space-y-1">
                          <p className="font-bold text-slate-800">{formatDate(item.date)}</p>
                          <div className="border-t border-slate-100 pt-1 space-y-0.5">
                            <p className="flex justify-between gap-4">
                              <span className="text-slate-400">Daily Net P&L:</span>
                              <span
                                className={`font-mono font-bold ${
                                  item.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {formatCurrency(item.netPnl, currency, true)}
                              </span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span className="text-slate-400">Trades Executed:</span>
                              <span className="font-mono text-slate-800 font-semibold">{item.tradesCount}</span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span className="text-slate-400">Win Rate:</span>
                              <span className="font-mono text-slate-800 font-semibold">{item.winRate}%</span>
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
                      fill={entry.netPnl >= 0 ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
