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
    <div className="flex flex-col h-full rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] shadow-xs overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E7EBF2] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FD] dark:bg-blue-950/60 text-[#3157D5] dark:text-blue-400">
            <BarChart3 className="h-4 w-4 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-[#172033] dark:text-white font-sans tracking-tight">
            Daily Realized P&L
          </h3>
        </div>

        <button className="flex items-center gap-1.5 rounded-lg bg-[#F6F8FC] dark:bg-slate-800 hover:bg-[#EEF2FD] dark:hover:bg-slate-700 text-[#172033] dark:text-slate-200 px-2.5 py-1 text-xs font-semibold border border-[#E7EBF2] dark:border-slate-700 transition-colors">
          <span>This Month</span>
          <ChevronDown className="h-3 w-3 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 p-5 flex flex-col items-center justify-center min-h-[240px]">
        {(!data || data.length === 0) ? (
          <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
            <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FD] text-[#3157D5] shadow-xs">
              <CalendarCheck className="h-6 w-6 stroke-[2.2]" />
            </div>

            <h4 className="text-sm font-bold text-[#172033] dark:text-white">
              No daily activity recorded
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 mb-4 leading-relaxed font-medium">
              Track your trades to see daily performance and win/loss statistics.
            </p>

            <button
              onClick={() => router.push('/journal')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3157D5] hover:bg-[#2745AE] text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105"
            >
              <span>View Journal</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EBF2" />
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
                        <div className="rounded-xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-3 shadow-lg text-xs font-sans space-y-1">
                          <p className="font-bold text-[#172033] dark:text-white">{formatDate(item.date)}</p>
                          <div className="border-t border-[#E7EBF2] dark:border-slate-800 pt-1 space-y-0.5">
                            <p className="flex justify-between gap-4">
                              <span className="text-[#64748B] dark:text-slate-400">Daily Net P&L:</span>
                              <span
                                className={`font-mono font-bold ${
                                  item.netPnl >= 0 ? 'text-[#159B72]' : 'text-[#E05260]'
                                }`}
                              >
                                {formatCurrency(item.netPnl, currency, true)}
                              </span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span className="text-[#64748B] dark:text-slate-400">Trades Executed:</span>
                              <span className="font-mono text-[#172033] dark:text-white font-semibold">{item.tradesCount}</span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span className="text-[#64748B] dark:text-slate-400">Win Rate:</span>
                              <span className="font-mono text-[#172033] dark:text-white font-semibold">{item.winRate}%</span>
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
                      fill={entry.netPnl >= 0 ? '#159B72' : '#E05260'}
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
