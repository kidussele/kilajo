'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { useTrading } from '@/context/trading-context'
import { Trade } from '@/types/trading'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { TradeModal } from '@/components/trades/trade-modal'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Download,
  UploadCloud,
  BarChart3,
  TrendingUp,
  Trophy,
  Settings,
  Crosshair,
  Hourglass,
  Calendar,
  ListFilter,
  Layers,
  ChevronDown,
  Bot,
  Sparkles,
} from 'lucide-react'

export default function JournalPage() {
  const router = useRouter()
  const { filteredTrades, deleteTrade, accounts, strategies, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  // Local filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'BUY' | 'SELL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL')
  const [selectedSession, setSelectedSession] = useState<'ALL' | string>('ALL')
  const [selectedDateFilter, setSelectedDateFilter] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Modals state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null)
  const [tradeToView, setTradeToView] = useState<Trade | null>(null)
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null)
  const [tradeAiAudit, setTradeAiAudit] = useState<string | null>(null)
  const [isAuditingTrade, setIsAuditingTrade] = useState(false)

  const handleAuditTradeWithAi = async (trade: Trade) => {
    setIsAuditingTrade(true)
    setTradeAiAudit(null)
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-single-trade',
          trade,
        }),
      })
      const data = await res.json()
      if (data.analysis) {
        setTradeAiAudit(data.analysis)
      } else {
        throw new Error(data.error || 'Audit failed')
      }
    } catch (err: any) {
      setTradeAiAudit(`⚠️ Failed to audit trade: ${err.message}`)
    } finally {
      setIsAuditingTrade(false)
    }
  }

  // Filter and sort trades
  const processedTrades = useMemo(() => {
    return filteredTrades
      .filter((t) => {
        if (selectedDirection !== 'ALL' && t.direction !== selectedDirection) return false
        if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false
        if (selectedSession !== 'ALL' && t.session !== selectedSession) return false
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchSymbol = t.symbol.toLowerCase().includes(q)
          const matchNotes = t.notes?.toLowerCase().includes(q)
          const matchTicket = t.source_ticket?.toLowerCase().includes(q)
          if (!matchSymbol && !matchNotes && !matchTicket) return false
        }
        return true
      })
      .sort((a, b) => {
        const timeA = new Date(a.exit_time || a.entry_time).getTime()
        const timeB = new Date(b.exit_time || b.entry_time).getTime()
        return timeB - timeA
      })
  }, [filteredTrades, selectedDirection, selectedStatus, selectedSession, searchQuery])

  const totalPages = Math.ceil(processedTrades.length / pageSize) || 1
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return processedTrades.slice(start, start + pageSize)
  }, [processedTrades, currentPage, pageSize])

  // Journal metrics
  const journalMetrics = useMemo(() => {
    const closed = filteredTrades.filter((t) => t.status === 'CLOSED')
    const openTrades = filteredTrades.filter((t) => t.status === 'OPEN')
    const netPnl = closed.reduce((sum, t) => sum + Number(t.net_pnl || 0), 0)
    const wins = closed.filter((t) => Number(t.net_pnl || 0) > 0.0001)
    const losses = closed.filter((t) => Number(t.net_pnl || 0) < -0.0001)
    const winRate = wins.length + losses.length > 0 ? (wins.length / (wins.length + losses.length)) * 100 : 0
    const grossProfit = wins.reduce((sum, t) => sum + Number(t.gross_pnl || t.net_pnl || 0), 0)
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + Number(t.gross_pnl || t.net_pnl || 0), 0))
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99 : 0

    return {
      total: filteredTrades.length,
      netPnl,
      winRate: Math.round(winRate),
      winsCount: wins.length,
      lossesCount: losses.length,
      profitFactor,
      openCount: openTrades.length,
    }
  }, [filteredTrades])

  const handleExportCsv = () => {
    if (processedTrades.length === 0) return
    const headers = [
      'Ticket',
      'Symbol',
      'Direction',
      'Lots',
      'Entry Price',
      'Exit Price',
      'Entry Time',
      'Exit Time',
      'Status',
      'Gross PnL',
      'Commission',
      'Swap',
      'Net PnL',
      'R-Multiple',
      'Session',
      'Notes',
    ]
    const rows = processedTrades.map((t) => [
      t.source_ticket || '',
      t.symbol,
      t.direction,
      t.quantity,
      t.entry_price,
      t.exit_price || '',
      t.entry_time,
      t.exit_time || '',
      t.status,
      t.gross_pnl,
      t.commission,
      t.swap,
      t.net_pnl,
      t.r_multiple || '',
      t.session || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `kilajo_trades_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteConfirmed = async () => {
    if (tradeToDelete) {
      await deleteTrade(tradeToDelete.id)
      setTradeToDelete(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="Trade Journal"
          subtitle="Comprehensive record of executed trades, setups, and notes for better analysis and consistent growth."
          iconElement={
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-white shadow-md shadow-emerald-900/20">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="14" width="3.5" height="7" rx="1.5" />
                <rect x="8.5" y="10" width="3.5" height="11" rx="1.5" />
                <rect x="14" y="6" width="3.5" height="15" rx="1.5" />
                <rect x="19.5" y="2" width="3.5" height="19" rx="1.5" />
              </svg>
            </div>
          }
          middleContent={
            <div className="flex items-center gap-2 rounded-full bg-white/60 dark:bg-slate-900/80 p-1 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span>Export CSV</span>
              </button>
              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />
              <button
                onClick={() => router.push('/import')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-4 py-1.5 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5 stroke-[2.2]" />
                <span>Import Trade</span>
              </button>
            </div>
          }
          quote="Consistency is the product of disciplined execution."
        />

        {/* 2. 6 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            title="Total Journaled"
            value={journalMetrics.total.toString()}
            subtitle={`${journalMetrics.openCount} open positions`}
            icon={BarChart3}
            color="emerald"
          />

          <MetricCard
            title="Realized P&L"
            value={formatCurrency(journalMetrics.netPnl, currency, true)}
            subtitle="▲ Profit • Net Profit/Loss"
            trend={journalMetrics.netPnl >= 0 ? '▲ Profit' : '▼ Loss'}
            trendPositive={journalMetrics.netPnl >= 0}
            icon={TrendingUp}
            color="purple"
          />

          <MetricCard
            title="Win Rate"
            value={`${journalMetrics.winRate}%`}
            subtitle={`${journalMetrics.winsCount}W / ${journalMetrics.lossesCount}L`}
            icon={Trophy}
            color="amber"
          />

          <MetricCard
            title="Profit Factor"
            value={journalMetrics.profitFactor > 0 ? journalMetrics.profitFactor.toString() : '0'}
            subtitle={journalMetrics.profitFactor >= 1.5 ? 'Institutional Edge' : 'Developing...'}
            icon={Settings}
            color="blue"
          />

          <MetricCard
            title="Open Trades"
            value={journalMetrics.openCount.toString()}
            subtitle="Active market view"
            icon={Crosshair}
            color="teal"
          />

          <MetricCard
            title="Avg Win/Loss"
            value={`${journalMetrics.winsCount}:${journalMetrics.lossesCount || 1}`}
            subtitle="Win/Loss Ratio"
            icon={Hourglass}
            color="purple"
          />
        </div>

        {/* 3. Filter Bar (Single Row Matching Screenshot) */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-[#0c141c] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-200">
          {/* Search Pill */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol, notes, ticket..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
            />
          </div>

          {/* Direction Filter */}
          <div className="relative">
            <select
              value={selectedDirection}
              onChange={(e) => {
                setSelectedDirection(e.target.value as any)
                setCurrentPage(1)
              }}
              className="appearance-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <option value="ALL">Direction: All</option>
              <option value="BUY">BUY / LONG</option>
              <option value="SELL">SELL / SHORT</option>
            </select>
            <ListFilter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.2] pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any)
                setCurrentPage(1)
              }}
              className="appearance-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="CLOSED">CLOSED</option>
              <option value="OPEN">OPEN</option>
            </select>
            <Layers className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.2] pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Session Filter */}
          <div className="relative">
            <select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <option value="ALL">Session: All</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="London/NY Overlap">London/NY Overlap</option>
              <option value="Asian">Asian</option>
            </select>
            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.2] pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Picker Button */}
          <div className="relative flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs gap-2">
            <Calendar className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.2]" />
            <span>Date</span>
            <Calendar className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </div>
        </div>

        {/* 4. Main Trades Container */}
        {processedTrades.length === 0 ? (
          /* Empty State Matching Screenshot 2 */
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-12 text-center shadow-xs select-none">
            {/* Center Notebook Illustration */}
            <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto">
              <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
                {/* Green Notebook Vector Graphic */}
                <svg className="w-20 h-20 text-emerald-700" viewBox="0 0 64 64" fill="none">
                  <rect x="14" y="8" width="36" height="48" rx="4" fill="#044c37" />
                  <rect x="10" y="12" width="6" height="40" rx="2" fill="#065f46" />
                  {/* Spiral rings */}
                  <line x1="12" y1="16" x2="16" y2="16" stroke="white" strokeWidth="1.5" />
                  <line x1="12" y1="24" x2="16" y2="24" stroke="white" strokeWidth="1.5" />
                  <line x1="12" y1="32" x2="16" y2="32" stroke="white" strokeWidth="1.5" />
                  <line x1="12" y1="40" x2="16" y2="40" stroke="white" strokeWidth="1.5" />
                  <line x1="12" y1="48" x2="16" y2="48" stroke="white" strokeWidth="1.5" />
                  {/* Trend chart on cover */}
                  <path d="M22 36 L28 28 L34 32 L42 20" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="38 20 42 20 42 24" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Pen */}
                  <rect x="46" y="14" width="4" height="34" rx="2" fill="#10b981" />
                  <polygon points="46,48 50,48 48,54" fill="#064e3b" />
                </svg>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                No trades match your criteria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed font-medium">
                Try resetting your filters or log a new trade using the button below.
              </p>

              <button
                onClick={() => {
                  setTradeToEdit(null)
                  setIsTradeModalOpen(true)
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-6 py-2.5 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Log a Trade</span>
              </button>
            </div>

            {/* Subtle Bottom Mint Wave Decoration */}
            <div className="absolute -bottom-2 -left-2 -right-2 h-16 pointer-events-none opacity-40 dark:opacity-10">
              <svg className="w-full h-full text-emerald-200 dark:text-emerald-800" viewBox="0 0 600 60" preserveAspectRatio="none">
                <path d="M0,35 C150,55 350,10 600,45 L600,60 L0,60 Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        ) : (
          /* Populated Table matching the light-first theme */
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Direction</th>
                    <th className="py-3.5 px-4">Symbol</th>
                    <th className="py-3.5 px-4">Lots</th>
                    <th className="py-3.5 px-4">Entry Price</th>
                    <th className="py-3.5 px-4">Exit Price</th>
                    <th className="py-3.5 px-4">Net P&L</th>
                    <th className="py-3.5 px-4">R-Multiple</th>
                    <th className="py-3.5 px-4">Session</th>
                    <th className="py-3.5 px-4">Discipline</th>
                    <th className="py-3.5 px-4">Close Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 dark:divide-slate-800">
                  {paginatedTrades.map((trade) => {
                    const isBuy = trade.direction === 'BUY'
                    const net = Number(trade.net_pnl || 0)
                    const isWin = net > 0
                    const isLoss = net < 0

                    return (
                      <tr key={trade.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                              isBuy
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                                : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50'
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
                        <td className="py-3 px-4 font-bold font-mono text-slate-900 dark:text-white">
                          {trade.symbol}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                          {trade.quantity}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                          {trade.entry_price}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                          {trade.exit_price ?? '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold tabular-nums">
                          <span
                            className={
                              trade.status === 'OPEN'
                                ? 'text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-[11px]'
                                : isWin
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isLoss
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }
                          >
                            {trade.status === 'OPEN'
                              ? 'OPEN'
                              : formatCurrency(net, currency, true)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums">
                          {trade.r_multiple !== null && trade.r_multiple !== undefined ? (
                            <span
                              className={`font-semibold ${
                                trade.r_multiple >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                              }`}
                            >
                              {trade.r_multiple > 0 ? `+${trade.r_multiple}R` : `${trade.r_multiple}R`}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{trade.session || '—'}</td>
                        <td className="py-3 px-4">
                          {trade.discipline_rating ? (
                            <span className="font-mono text-xs text-amber-500">
                              {'★'.repeat(trade.discipline_rating)}
                              <span className="text-slate-200 dark:text-slate-700">
                                {'★'.repeat(5 - trade.discipline_rating)}
                              </span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                          {formatDateTime(trade.exit_time || trade.entry_time)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setTradeToView(trade)
                                setTradeAiAudit(null)
                              }}
                              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title="View trade breakdown"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setTradeToEdit(trade)
                                setIsTradeModalOpen(true)
                              }}
                              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title="Edit trade"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setTradeToDelete(trade)}
                              className="rounded-lg p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete trade"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, processedTrades.length)} of{' '}
                  {processedTrades.length} trades
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-7 w-7 p-0 rounded-lg cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="px-2 font-mono font-bold text-slate-800 dark:text-white">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 p-0 rounded-lg"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trade Modal for Add / Edit */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false)
          setTradeToEdit(null)
        }}
        tradeToEdit={tradeToEdit}
      />

      {/* View Trade Detail Modal */}
      {tradeToView && (
        <Modal
          isOpen={!!tradeToView}
          onClose={() => setTradeToView(null)}
          title={`Trade Breakdown — ${tradeToView.symbol} (${tradeToView.direction})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Net P&L</span>
                <span
                  className={`font-mono text-base font-bold ${
                    Number(tradeToView.net_pnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(tradeToView.net_pnl, currency, true)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gross P&L</span>
                <span className="font-mono text-base font-bold text-slate-800">
                  {formatCurrency(tradeToView.gross_pnl, currency, true)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Fees & Commission</span>
                <span className="font-mono text-base font-bold text-slate-800">
                  {formatCurrency(Number(tradeToView.commission || 0) + Number(tradeToView.swap || 0), currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">R-Multiple</span>
                <span className="font-mono text-base font-bold text-slate-800">
                  {tradeToView.r_multiple ? `${tradeToView.r_multiple}R` : '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Entry Price & Time</span>
                <p className="font-mono font-semibold text-slate-800">
                  {tradeToView.entry_price} @ {formatDateTime(tradeToView.entry_time)}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Exit Price & Time</span>
                <p className="font-mono font-semibold text-slate-800">
                  {tradeToView.exit_price ?? '—'} @ {tradeToView.exit_time ? formatDateTime(tradeToView.exit_time) : 'Open'}
                </p>
              </div>
            </div>

            {tradeToView.notes && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-slate-400 block text-[11px] mb-1">Trade Notes & Psychological Review</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{tradeToView.notes}"
                </p>
              </div>
            )}

            {/* AI Assistant Audit Block */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                  <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>AI Coach: Mistake & Execution Audit</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAuditTradeWithAi(tradeToView)}
                  disabled={isAuditingTrade}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isAuditingTrade ? 'Auditing...' : 'Audit This Trade'}</span>
                </button>
              </div>

              {tradeAiAudit && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {tradeAiAudit}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {tradeToDelete && (
        <Modal
          isOpen={!!tradeToDelete}
          onClose={() => setTradeToDelete(null)}
          title="Delete Trade Execution"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete trade <strong className="font-mono text-slate-900">{tradeToDelete.symbol}</strong>? This action will permanently remove the record and recalculate your account balance.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setTradeToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteConfirmed}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
