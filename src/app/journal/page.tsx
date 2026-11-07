'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { Trade } from '@/types/trading'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { TradeModal } from '@/components/trades/trade-modal'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  Search,
  PlusCircle,
  Filter,
  Trash2,
  Edit2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

export default function JournalPage() {
  const { filteredTrades, deleteTrade, accounts, strategies, activeAccount } = useTrading()

  const currency = activeAccount?.currency || 'USD'

  // Local search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'BUY' | 'SELL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL')
  const [selectedSession, setSelectedSession] = useState<'ALL' | string>('ALL')
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'quantity'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Modals state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null)
  const [tradeToView, setTradeToView] = useState<Trade | null>(null)
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null)

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
        let comp = 0
        if (sortBy === 'date') {
          const timeA = new Date(a.exit_time || a.entry_time).getTime()
          const timeB = new Date(b.exit_time || b.entry_time).getTime()
          comp = timeA - timeB
        } else if (sortBy === 'pnl') {
          comp = Number(a.net_pnl || 0) - Number(b.net_pnl || 0)
        } else if (sortBy === 'quantity') {
          comp = Number(a.quantity) - Number(b.quantity)
        }
        return sortOrder === 'desc' ? -comp : comp
      })
  }, [filteredTrades, searchQuery, selectedDirection, selectedStatus, selectedSession, sortBy, sortOrder])

  // Paginated trades
  const totalPages = Math.ceil(processedTrades.length / pageSize) || 1
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return processedTrades.slice(start, start + pageSize)
  }, [processedTrades, currentPage, pageSize])

  // Export visible trades to CSV
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

  const handleDeleteConfirmed = () => {
    if (tradeToDelete) {
      deleteTrade(tradeToDelete.id)
      setTradeToDelete(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              TRADING JOURNAL
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive log of all executed trades, behavioral parameters, and review notes ({processedTrades.length} trades found)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="gap-1.5 text-xs font-semibold"
              disabled={processedTrades.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setTradeToEdit(null)
                setIsTradeModalOpen(true)
              }}
              className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Log Trade</span>
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 bg-card p-3 rounded-xl border shadow-xs">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbol, notes, ticket..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-md border bg-background pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Direction Filter */}
          <select
            value={selectedDirection}
            onChange={(e) => {
              setSelectedDirection(e.target.value as any)
              setCurrentPage(1)
            }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-xs"
          >
            <option value="ALL">Direction: All</option>
            <option value="BUY">BUY / LONG Only</option>
            <option value="SELL">SELL / SHORT Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any)
              setCurrentPage(1)
            }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-xs"
          >
            <option value="ALL">Status: All</option>
            <option value="CLOSED">CLOSED</option>
            <option value="OPEN">OPEN</option>
          </select>

          {/* Session Filter */}
          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-xs"
          >
            <option value="ALL">Session: All</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
            <option value="London/NY Overlap">London/NY Overlap</option>
            <option value="Asian">Asian</option>
          </select>

          {/* Sort By */}
          <div className="flex gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
            >
              <option value="date">Date</option>
              <option value="pnl">Net P&L</option>
              <option value="quantity">Size</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded-md border px-2 py-1.5 text-xs hover:bg-accent font-mono font-bold"
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Trades Table */}
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          {paginatedTrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Filter className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No trades match your criteria</p>
              <p className="text-xs mt-1 max-w-sm">
                Try resetting your filters or log a new trade using the button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-3">Direction</th>
                    <th className="py-3 px-3">Symbol</th>
                    <th className="py-3 px-3">Lots</th>
                    <th className="py-3 px-3">Entry Price</th>
                    <th className="py-3 px-3">Exit Price</th>
                    <th className="py-3 px-3">Net P&L</th>
                    <th className="py-3 px-3">R-Multiple</th>
                    <th className="py-3 px-3">Session</th>
                    <th className="py-3 px-3">Discipline</th>
                    <th className="py-3 px-3">Close Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedTrades.map((trade) => {
                    const isBuy = trade.direction === 'BUY'
                    const net = Number(trade.net_pnl || 0)
                    const isWin = net > 0
                    const isLoss = net < 0

                    return (
                      <tr key={trade.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3 px-3">
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
                        <td className="py-3 px-3 font-semibold font-mono text-foreground">
                          {trade.symbol}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-muted-foreground">
                          {trade.quantity}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-muted-foreground">
                          {trade.entry_price}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-muted-foreground">
                          {trade.exit_price ?? '—'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold tabular-nums">
                          <span
                            className={
                              trade.status === 'OPEN'
                                ? 'text-amber-600 font-semibold'
                                : isWin
                                ? 'text-emerald-600'
                                : isLoss
                                ? 'text-red-600'
                                : 'text-muted-foreground'
                            }
                          >
                            {trade.status === 'OPEN'
                              ? 'OPEN POSITION'
                              : formatCurrency(net, currency, true)}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">
                          {trade.r_multiple !== null && trade.r_multiple !== undefined ? (
                            <span
                              className={`font-semibold ${
                                trade.r_multiple >= 0 ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              {trade.r_multiple > 0 ? `+${trade.r_multiple}R` : `${trade.r_multiple}R`}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{trade.session || '—'}</td>
                        <td className="py-3 px-3">
                          {trade.discipline_rating ? (
                            <span className="font-mono text-xs">
                              {'★'.repeat(trade.discipline_rating)}
                              <span className="text-muted-foreground/30">
                                {'★'.repeat(5 - trade.discipline_rating)}
                              </span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {formatDateTime(trade.exit_time || trade.entry_time)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => setTradeToView(trade)}
                              className="rounded p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
                              title="View trade breakdown"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {/* Edit Trade */}
                            <button
                              onClick={() => {
                                setTradeToEdit(trade)
                                setIsTradeModalOpen(true)
                              }}
                              className="rounded p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
                              title="Edit trade"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {/* Delete Trade */}
                            <button
                              onClick={() => setTradeToDelete(trade)}
                              className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
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
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 font-mono font-medium text-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* View Trade Detail Modal */}
        {tradeToView && (
          <Modal
            isOpen={!!tradeToView}
            onClose={() => setTradeToView(null)}
            title={`Trade Details — ${tradeToView.symbol} (${tradeToView.direction})`}
            description={`Execution ticket #${tradeToView.source_ticket || 'MANUAL'}`}
            maxWidth="xl"
          >
            <div className="space-y-4 text-xs">
              {/* Financial Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  Number(tradeToView.net_pnl) >= 0
                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                    : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50'
                }`}
              >
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Net Profit / Loss
                  </span>
                  <p
                    className={`text-2xl font-bold font-mono ${
                      Number(tradeToView.net_pnl) >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {tradeToView.status === 'OPEN'
                      ? 'OPEN'
                      : formatCurrency(Number(tradeToView.net_pnl), currency, true)}
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-muted-foreground">
                    R-Multiple:{' '}
                    <span className="font-mono font-bold text-foreground">
                      {tradeToView.r_multiple ? `${tradeToView.r_multiple}R` : '—'}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Risk Amount:{' '}
                    <span className="font-mono text-foreground">
                      {tradeToView.risk_amount ? formatCurrency(tradeToView.risk_amount, currency) : '—'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border rounded-lg p-3 bg-muted/10">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Entry Price</span>
                  <span className="font-mono font-bold text-foreground">{tradeToView.entry_price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Exit Price</span>
                  <span className="font-mono font-bold text-foreground">{tradeToView.exit_price ?? '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Stop Loss</span>
                  <span className="font-mono font-bold text-foreground">{tradeToView.stop_loss ?? '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Take Profit</span>
                  <span className="font-mono font-bold text-foreground">{tradeToView.take_profit ?? '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border rounded-lg p-3 bg-muted/10">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Gross P&L</span>
                  <span className="font-mono text-foreground">{formatCurrency(tradeToView.gross_pnl, currency)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Commission</span>
                  <span className="font-mono text-muted-foreground">-${tradeToView.commission}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Swap</span>
                  <span className="font-mono text-muted-foreground">${tradeToView.swap}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Session</span>
                  <span className="font-medium text-foreground">{tradeToView.session || '—'}</span>
                </div>
              </div>

              {/* Psychology & Discipline Review */}
              <div className="space-y-2 border rounded-lg p-3">
                <span className="font-semibold text-foreground block">Behavioral Analysis</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Emotion Before</span>
                    <span className="font-medium">{tradeToView.emotion_before || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Emotion After</span>
                    <span className="font-medium">{tradeToView.emotion_after || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Discipline Score</span>
                    <span className="font-mono font-bold">
                      {tradeToView.discipline_rating ? `${tradeToView.discipline_rating} / 5` : '—'}
                    </span>
                  </div>
                </div>

                {tradeToView.mistakes && tradeToView.mistakes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-muted-foreground text-[10px] block mb-1">Mistakes Recorded:</span>
                    <div className="flex flex-wrap gap-1">
                      {tradeToView.mistakes.map((m) => (
                        <span
                          key={m}
                          className="bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 px-2 py-0.5 rounded text-[10px] font-semibold"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trade Notes */}
              {tradeToView.notes && (
                <div className="border rounded-lg p-3 bg-card">
                  <span className="font-semibold text-foreground block mb-1">Trade Notes & Reflections</span>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tradeToView.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => setTradeToView(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {tradeToDelete && (
          <Modal
            isOpen={!!tradeToDelete}
            onClose={() => setTradeToDelete(null)}
            title="Delete Trade Execution?"
            description="Are you sure you want to delete this trade from your journal? This will adjust your portfolio balance and analytics."
            maxWidth="sm"
          >
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>This action cannot be undone.</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setTradeToDelete(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteConfirmed}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        <TradeModal
          isOpen={isTradeModalOpen}
          onClose={() => {
            setIsTradeModalOpen(false)
            setTradeToEdit(null)
          }}
          tradeToEdit={tradeToEdit}
        />
      </div>
    </DashboardLayout>
  )
}
