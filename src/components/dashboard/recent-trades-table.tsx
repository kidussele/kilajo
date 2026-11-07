'use client'

import React from 'react'
import Link from 'next/link'
import { Trade } from '@/types/trading'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'

interface RecentTradesTableProps {
  trades: Trade[]
  currency?: string
}

export function RecentTradesTable({ trades, currency = 'USD' }: RecentTradesTableProps) {
  const displayTrades = trades.slice(0, 6)

  if (displayTrades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10">
        <p className="text-sm font-medium">No recent trades found</p>
        <p className="text-xs mt-1">Start by logging your first trade or importing a statement.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b bg-muted/40 text-muted-foreground font-semibold">
          <tr>
            <th className="py-2.5 px-3">Direction</th>
            <th className="py-2.5 px-3">Symbol</th>
            <th className="py-2.5 px-3">Lots</th>
            <th className="py-2.5 px-3">Entry / Exit</th>
            <th className="py-2.5 px-3">Net P&L</th>
            <th className="py-2.5 px-3">R-Multiple</th>
            <th className="py-2.5 px-3 text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {displayTrades.map((trade) => {
            const isBuy = trade.direction === 'BUY'
            const net = Number(trade.net_pnl || 0)
            const isWin = net > 0
            const isLoss = net < 0

            return (
              <tr key={trade.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded ${
                      isBuy
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    }`}
                  >
                    {isBuy ? (
                      <ArrowUpRight className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 stroke-[3]" />
                    )}
                    {trade.direction}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-semibold font-mono text-foreground">{trade.symbol}</td>
                <td className="py-2.5 px-3 font-mono tabular-nums text-muted-foreground">{trade.quantity}</td>
                <td className="py-2.5 px-3 font-mono tabular-nums text-muted-foreground">
                  {trade.entry_price} {trade.exit_price ? `→ ${trade.exit_price}` : ''}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold tabular-nums">
                  <span
                    className={
                      isWin ? 'text-emerald-600' : isLoss ? 'text-red-600' : 'text-muted-foreground'
                    }
                  >
                    {trade.status === 'OPEN'
                      ? 'OPEN'
                      : formatCurrency(net, currency, true)}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono tabular-nums">
                  {trade.r_multiple !== null && trade.r_multiple !== undefined ? (
                    <span className={trade.r_multiple >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-500'}>
                      {trade.r_multiple > 0 ? `+${trade.r_multiple}R` : `${trade.r_multiple}R`}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2.5 px-3 text-right text-muted-foreground">
                  {formatDateTime(trade.exit_time || trade.entry_time)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="p-2 border-t text-center">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <span>View All Trades in Trading Journal</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
