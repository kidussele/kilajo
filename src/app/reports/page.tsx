'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Download, Printer, Calendar, FileText, CheckCircle } from 'lucide-react'

export default function ReportsPage() {
  const { filteredTrades, metrics, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [reportType, setReportType] = useState<'MONTHLY' | 'WEEKLY' | 'ALL'>('ALL')

  // CSV Export
  const handleExportCsv = () => {
    if (filteredTrades.length === 0) return
    const headers = [
      'Ticket',
      'Symbol',
      'Direction',
      'Lots',
      'Entry Price',
      'Exit Price',
      'Entry Time',
      'Exit Time',
      'Net PnL',
      'Gross PnL',
      'Commission',
      'Swap',
      'R-Multiple',
      'Session',
    ]
    const rows = filteredTrades.map((t) => [
      t.source_ticket || '',
      t.symbol,
      t.direction,
      t.quantity,
      t.entry_price,
      t.exit_price || '',
      t.entry_time,
      t.exit_time || '',
      t.net_pnl,
      t.gross_pnl,
      t.commission,
      t.swap,
      t.r_multiple || '',
      t.session || '',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `kilajo_performance_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print / PDF Export
  const handlePrint = () => {
    window.print()
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Page Hero Banner */}
        <div className="print:hidden">
          <PageHeroBanner
            title="Performance Reports"
            subtitle="Generate institutional financial statements, strategy reports, and tax-ready CSV/PDF summaries"
            icon={FileSpreadsheet}
            quote="Audited numbers build institutional confidence."
          >
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </PageHeroBanner>
        </div>

        {/* Report Document Presentation */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xs print:shadow-none print:border-none">
          {/* Statement Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-foreground tracking-wider">KILAJO</span>
                <span className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground font-bold px-1.5 py-0.5 rounded">
                  OFFICIAL STATEMENT
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Universal Trading Performance Audit Report</p>
            </div>

            <div className="text-right text-xs">
              <p className="font-semibold text-foreground">Generated: {formatDate(new Date().toISOString())}</p>
              <p className="text-muted-foreground">Scope: {activeAccount?.name || 'All Connected Accounts'}</p>
              <p className="text-muted-foreground">Currency: {currency}</p>
            </div>
          </div>

          {/* Core Performance Summary Table */}
          <div className="my-6">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-3">
              1. Executive Performance Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border bg-muted/10 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Net Realized Profit</span>
                <span
                  className={`font-mono text-base font-bold ${
                    metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(metrics.netProfit, currency, true)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Profit Factor</span>
                <span className="font-mono text-base font-bold text-foreground">{metrics.profitFactor}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Win Rate</span>
                <span className="font-mono text-base font-bold text-foreground">{metrics.winRate}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Expectancy</span>
                <span className="font-mono text-base font-bold text-foreground">
                  {formatCurrency(metrics.expectancy, currency, true)}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6 p-3 rounded-lg border bg-card">
            <div>
              <span className="text-muted-foreground text-[10px] block">Gross Profit</span>
              <span className="font-mono font-bold text-emerald-600">{formatCurrency(metrics.grossProfit, currency)}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">Gross Loss</span>
              <span className="font-mono font-bold text-red-600">-{formatCurrency(metrics.grossLoss, currency)}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">Total Commission & Swap</span>
              <span className="font-mono font-bold text-muted-foreground">
                -{formatCurrency(metrics.totalCommissions + metrics.totalSwap, currency)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">Max Drawdown</span>
              <span className="font-mono font-bold text-red-600">
                -{formatCurrency(metrics.maxDrawdownAmount, currency)} ({metrics.maxDrawdownPercentage}%)
              </span>
            </div>
          </div>

          {/* Trade Executions Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              2. Executed Trades ({filteredTrades.length} Records)
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b font-semibold text-muted-foreground text-[11px]">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Symbol</th>
                    <th className="p-2.5">Side</th>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">In</th>
                    <th className="p-2.5">Out</th>
                    <th className="p-2.5 text-right">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTrades.slice(0, 25).map((t) => (
                    <tr key={t.id} className="hover:bg-muted/20">
                      <td className="p-2.5 text-muted-foreground">{formatDate(t.exit_time || t.entry_time)}</td>
                      <td className="p-2.5 font-mono font-bold text-foreground">{t.symbol}</td>
                      <td className="p-2.5 font-bold">{t.direction}</td>
                      <td className="p-2.5 font-mono">{t.quantity}</td>
                      <td className="p-2.5 font-mono">{t.entry_price}</td>
                      <td className="p-2.5 font-mono">{t.exit_price ?? '—'}</td>
                      <td className="p-2.5 font-mono font-bold text-right">
                        <span className={Number(t.net_pnl) >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {formatCurrency(t.net_pnl, currency, true)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTrades.length > 25 && (
              <p className="text-center text-xs text-muted-foreground italic pt-2">
                Statement displays first 25 records. Complete list available via CSV export.
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

