'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  FileText,
  TrendingUp,
  Percent,
  Trophy,
  Star,
  Sprout,
  ArrowDown,
  Coins,
  TrendingDown,
  ChevronDown,
  Layers,
  ArrowRightLeft,
  Barcode,
  Clock,
} from 'lucide-react'

export default function ReportsPage() {
  const { filteredTrades, metrics, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [selectedCurrency, setSelectedCurrency] = useState(currency)

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

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto">
        {/* 1. Page Hero Banner */}
        <div className="print:hidden">
          <PageHeroBanner
            title="Performance Reports"
            subtitle="Generate institutional financial statements, strategy reports, and tax-ready CSV/PDF summaries."
            iconElement={
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-white shadow-md shadow-emerald-900/20">
                <FileSpreadsheet className="h-7 w-7 text-white stroke-[2.2]" />
              </div>
            }
            middleContent={
              <div className="flex items-center gap-2 rounded-full bg-white/70 p-1 border border-slate-200/80 shadow-2xs">
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-slate-600" />
                  <span>Export CSV</span>
                  <ChevronDown className="h-3 w-3 text-slate-400 stroke-[2.5]" />
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-4 py-1.5 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 stroke-[2.2]" />
                  <span>Print PDF</span>
                </button>
              </div>
            }
            quote="Audited numbers build institutional confidence."
          />
        </div>

        {/* 2. Official Statement Document Presentation Matching Screenshot 5 */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-7 sm:p-9 shadow-xs print:shadow-none print:border-none print:p-0 transition-colors duration-200">
          {/* Document Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-2xl text-slate-900 dark:text-white font-sans tracking-tight">
                  KILAJO
                </span>
                <span className="rounded-full bg-[#064e3b] text-white font-bold text-[10px] px-3 py-0.5 tracking-wider uppercase">
                  OFFICIAL STATEMENT
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Universal Trading Performance Audit Report
              </p>
            </div>

            <div className="flex flex-col sm:items-end text-xs text-slate-600 dark:text-slate-300 space-y-1 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Generated: {currentDateFormatted}</span>
              </div>
              <div>
                <span>Scope: {activeAccount?.name || 'All Connected Accounts'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Currency:</span>
                <span className="font-bold text-slate-800 dark:text-white font-mono">{selectedCurrency}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Section 1: Executive Performance Summary */}
          <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-sans uppercase tracking-wider">
                1. EXECUTIVE PERFORMANCE SUMMARY
              </h3>
            </div>

            {/* Row 1 of Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <MetricCard
                title="Net Realized Profit"
                value={formatCurrency(metrics.netProfit, currency, true)}
                subtitle=""
                icon={TrendingUp}
                color="emerald"
              />
              <MetricCard
                title="Profit Factor"
                value={metrics.profitFactor > 0 ? metrics.profitFactor.toString() : '0'}
                subtitle="--"
                icon={Percent}
                color="purple"
              />
              <MetricCard
                title="Win Rate"
                value={`${metrics.winRate}%`}
                subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
                icon={Trophy}
                color="amber"
              />
              <MetricCard
                title="Expectancy"
                value={formatCurrency(metrics.expectancy, currency, true)}
                subtitle=""
                icon={Star}
                color="blue"
              />
            </div>

            {/* Row 2 of Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Gross Profit"
                value={formatCurrency(metrics.grossProfit, currency, true)}
                subtitle=""
                icon={Sprout}
                color="teal"
              />
              <MetricCard
                title="Gross Loss"
                value={`-${formatCurrency(metrics.grossLoss, currency)}`}
                subtitle=""
                icon={ArrowDown}
                color="rose"
              />
              <MetricCard
                title="Total Commission & Swap"
                value={`-${formatCurrency(metrics.totalCommissions + metrics.totalSwap, currency)}`}
                subtitle=""
                icon={Coins}
                color="indigo"
              />
              <MetricCard
                title="Max Drawdown"
                value={`-${formatCurrency(metrics.maxDrawdownAmount, currency)} (${metrics.maxDrawdownPercentage}%)`}
                subtitle=""
                icon={TrendingDown}
                color="rose"
              />
            </div>
          </div>

          {/* Section 2: Executed Trades */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-sans uppercase tracking-wider">
                2. EXECUTED TRADES ({filteredTrades.length} RECORDS)
              </h3>
            </div>

            {/* Table Header Bar */}
            <div className="grid grid-cols-7 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Date</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Barcode className="h-3.5 w-3.5 text-slate-400" />
                <span>Symbol</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                <span>Side</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>Size</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>↔ In</span>
              </div>
              <div>
                <span>Out</span>
              </div>
              <div className="flex items-center gap-1.5 text-right justify-end">
                <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                <span>Net P&L</span>
              </div>
            </div>

            {/* Table Body / Empty State Matching Screenshot 5 */}
            {filteredTrades.length === 0 ? (
              <div className="relative p-12 flex flex-col items-center justify-center text-center">
                <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <FileText className="h-7 w-7 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                  <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No trades found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Your trading activity will appear here once you execute trades.
                </p>

                {/* Soft Mint Wave at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none opacity-30 dark:opacity-10">
                  <svg className="w-full h-full text-emerald-300 dark:text-emerald-700" viewBox="0 0 600 40" preserveAspectRatio="none">
                    <path d="M0,20 C150,40 350,5 600,25 L600,40 L0,40 Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-x border-b border-slate-100 dark:border-slate-800 rounded-b-2xl">
                {filteredTrades.slice(0, 30).map((t) => (
                  <div key={t.id} className="grid grid-cols-7 px-5 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50/70 dark:hover:bg-slate-800/60">
                    <span className="font-mono text-slate-500 dark:text-slate-400">{formatDate(t.exit_time || t.entry_time)}</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{t.symbol}</span>
                    <span className={`font-bold font-mono text-[11px] ${t.direction === 'BUY' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {t.direction}
                    </span>
                    <span className="font-mono">{t.quantity}</span>
                    <span className="font-mono">{t.entry_price}</span>
                    <span className="font-mono">{t.exit_price ?? '—'}</span>
                    <span className={`font-mono font-bold text-right ${Number(t.net_pnl) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(t.net_pnl, currency, true)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
