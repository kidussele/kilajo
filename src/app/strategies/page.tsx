'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { TrendingUp, PlusCircle, CheckCircle, Crosshair, BarChart2 } from 'lucide-react'

export default function StrategiesPage() {
  const { strategies, addStrategy, trades, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [timeframe, setTimeframe] = useState('5m / 15m')
  const [entryConditions, setEntryConditions] = useState('')
  const [exitConditions, setExitConditions] = useState('')

  // Calculate live stats per strategy from actual trades
  const strategyStats = useMemo(() => {
    return strategies.map((strat) => {
      const stratTrades = trades.filter((t) => t.strategy_id === strat.id && t.status === 'CLOSED')
      const totalTrades = stratTrades.length
      const wins = stratTrades.filter((t) => Number(t.net_pnl) > 0).length
      const losses = stratTrades.filter((t) => Number(t.net_pnl) < 0).length
      const netPnl = stratTrades.reduce((acc, t) => acc + Number(t.net_pnl || 0), 0)
      const decisive = wins + losses
      const winRate = decisive > 0 ? (wins / decisive) * 100 : 0

      return {
        ...strat,
        totalTrades,
        wins,
        losses,
        netPnl,
        winRate: Number(winRate.toFixed(1)),
      }
    })
  }, [strategies, trades])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    addStrategy({
      user_id: 'default-user',
      name: name.trim(),
      description: description || null,
      timeframe: timeframe || null,
      entry_conditions: entryConditions || null,
      exit_conditions: exitConditions || null,
      is_active: true,
    })

    setName('')
    setDescription('')
    setEntryConditions('')
    setExitConditions('')
    setIsAddOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              STRATEGY PLAYBOOK
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Document edge models, define entry/exit rules, and audit profitability per setup
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Strategy</span>
          </Button>
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategyStats.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
              <TrendingUp className="h-10 w-10 text-primary/30 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">No strategies in your playbook</h3>
              <p className="text-xs mt-1 max-w-sm">
                Define your trading systems so you can tag each trade and identify which models generate consistent profit.
              </p>
              <Button size="sm" onClick={() => setIsAddOpen(true)} className="mt-4 text-xs font-semibold">
                Add Strategy
              </Button>
            </div>
          ) : (
            strategyStats.map((strat) => (
              <Card key={strat.id} className="shadow-xs overflow-hidden">
                <CardHeader className="bg-muted/15 border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold font-mono text-foreground">{strat.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">Timeframe: {strat.timeframe || 'Any'}</p>
                    </div>

                    <span
                      className={`font-mono font-bold text-sm ${
                        strat.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(strat.netPnl, currency, true)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs">
                  {strat.description && (
                    <p className="text-muted-foreground leading-relaxed">{strat.description}</p>
                  )}

                  {/* Rules Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-lg p-3 bg-muted/10">
                    <div>
                      <span className="font-semibold text-foreground block mb-0.5">Entry Protocol:</span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {strat.entry_conditions || 'Discretionary / No strict rule specified'}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block mb-0.5">Exit / Target Protocol:</span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {strat.exit_conditions || 'Discretionary / No strict rule specified'}
                      </p>
                    </div>
                  </div>

                  {/* Live Performance Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Executed</span>
                      <span className="font-mono font-bold text-foreground">{strat.totalTrades} Trades</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Win Rate</span>
                      <span className={`font-mono font-bold ${strat.winRate >= 50 ? 'text-emerald-600' : 'text-foreground'}`}>
                        {strat.winRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">W / L Record</span>
                      <span className="font-mono font-bold text-foreground">
                        {strat.wins}W - {strat.losses}L
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Strategy Modal */}
        {isAddOpen && (
          <Modal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            title="Create Trading Strategy"
            description="Document rules, timeframes, and criteria for this trading playbook model."
            maxWidth="md"
          >
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Strategy Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. London Open Liquidity Sweep"
                  className="w-full rounded border bg-background px-3 py-1.5 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Timeframe</label>
                <input
                  type="text"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  placeholder="e.g. 5m / 15m / 1h"
                  className="w-full rounded border bg-background px-3 py-1.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Strategy Summary / Thesis</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Explain the market edge and why this setup works."
                  className="w-full rounded border bg-background px-3 py-1.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Entry Conditions</label>
                <textarea
                  value={entryConditions}
                  onChange={(e) => setEntryConditions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Liquidity sweep + 5m displacement + retest of FVG"
                  className="w-full rounded border bg-background px-3 py-1.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Exit Conditions / Targets</label>
                <textarea
                  value={exitConditions}
                  onChange={(e) => setExitConditions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Fixed 2.5R or opposing high/low liquidity pool"
                  className="w-full rounded border bg-background px-3 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Add to Playbook
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

