'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency } from '@/lib/utils'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import {
  TrendingUp,
  PlusCircle,
  CheckCircle,
  Crosshair,
  BarChart2,
  Trophy,
  Layers,
  BarChart3,
  BookOpen,
  ShieldCheck,
} from 'lucide-react'

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

  const totalStratTrades = strategyStats.reduce((s, st) => s + st.totalTrades, 0)
  const bestStrategy = strategyStats.slice().sort((a, b) => b.netPnl - a.netPnl)[0]

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Strategy Playbook"
          subtitle="Document edge models, define entry/exit rules, and audit profitability per setup."
          icon={BarChart3}
          quote="Trade the plan. Execute the edge."
          middleContent={
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Strategy</span>
              <span className="font-bold">&gt;</span>
            </button>
          }
        />

        {/* Strategy Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Total Setups"
            value={strategies.length.toString()}
            trend="▲ No setups yet"
            trendPositive={true}
            icon={Crosshair}
            color="emerald"
            infoTooltip
          />
          <MetricCard
            title="Top Performer"
            value={bestStrategy ? bestStrategy.name : '--'}
            subtitle={bestStrategy ? formatCurrency(bestStrategy.netPnl, currency, true) : 'No trades yet'}
            icon={Trophy}
            color="purple"
            infoTooltip
          />
          <MetricCard
            title="Playbook Trades"
            value={totalStratTrades.toString()}
            trend="▲ Systematic executions"
            trendPositive={true}
            icon={Layers}
            color="amber"
            infoTooltip
          />
          <MetricCard
            title="Best Win Rate"
            value={bestStrategy ? `${bestStrategy.winRate}%` : '--'}
            subtitle="Highest setup edge"
            icon={BarChart2}
            color="blue"
            infoTooltip
          />
        </div>

        {/* Strategies Section */}
        {strategyStats.length === 0 ? (
          <div className="space-y-5">
            {/* Main Empty State Container */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-emerald-50/50 dark:bg-none dark:bg-[#0c141c] p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs">
              {/* Soft wave decorations at the bottom */}
              <div className="absolute -bottom-2 -left-2 -right-2 h-16 pointer-events-none opacity-40 dark:opacity-10">
                <svg className="w-full h-full" viewBox="0 0 600 60" preserveAspectRatio="none">
                  <path d="M0,40 C150,15 350,60 600,30 L600,60 L0,60 Z" fill="#10b981" fillOpacity="0.12" />
                  <path d="M0,50 C200,30 400,65 600,45 L600,60 L0,60 Z" fill="#059669" fillOpacity="0.18" />
                </svg>
              </div>

              {/* Open Playbook with Chess Piece Illustration */}
              <div className="relative mb-3 flex items-center justify-center">
                {/* Candlestick Watermark Behind Playbook */}
                <svg
                  className="absolute -top-4 h-32 w-80 pointer-events-none opacity-25 dark:opacity-10 text-emerald-500"
                  viewBox="0 0 240 80"
                  fill="currentColor"
                >
                  <rect x="20" y="35" width="4" height="20" rx="1" />
                  <line x1="22" y1="25" x2="22" y2="60" stroke="currentColor" strokeWidth="1" />
                  <rect x="40" y="25" width="4" height="30" rx="1" />
                  <line x1="42" y1="15" x2="42" y2="65" stroke="currentColor" strokeWidth="1" />
                  <rect x="60" y="40" width="4" height="15" rx="1" />
                  <line x1="62" y1="30" x2="62" y2="60" stroke="currentColor" strokeWidth="1" />
                  <rect x="80" y="20" width="4" height="35" rx="1" />
                  <line x1="82" y1="10" x2="82" y2="65" stroke="currentColor" strokeWidth="1" />
                  <rect x="160" y="25" width="4" height="30" rx="1" />
                  <line x1="162" y1="15" x2="162" y2="65" stroke="currentColor" strokeWidth="1" />
                  <rect x="180" y="15" width="4" height="40" rx="1" />
                  <line x1="182" y1="5" x2="182" y2="70" stroke="currentColor" strokeWidth="1" />
                  <rect x="200" y="30" width="4" height="25" rx="1" />
                  <line x1="202" y1="20" x2="202" y2="65" stroke="currentColor" strokeWidth="1" />
                  <rect x="220" y="20" width="4" height="35" rx="1" />
                  <line x1="222" y1="10" x2="222" y2="65" stroke="currentColor" strokeWidth="1" />
                </svg>

                {/* Open Book / Playbook with Chess Piece emerging */}
                <div className="relative flex flex-col items-center justify-center">
                  <svg className="w-52 h-40" viewBox="0 0 200 140" fill="none">
                    {/* Foliage leaves */}
                    <g fill="#10b981" opacity="0.9">
                      <path d="M45 80 C32 65 36 45 48 38 C52 54 52 70 45 80 Z" />
                      <path d="M58 95 C42 88 42 68 54 60 C62 72 64 86 58 95 Z" />
                      <path d="M155 80 C168 65 164 45 152 38 C148 54 148 70 155 80 Z" />
                      <path d="M142 95 C158 88 158 68 146 60 C138 72 136 86 142 95 Z" />
                    </g>

                    {/* Book Cover Base */}
                    <path
                      d="M20 95 C60 110 98 102 100 102 C102 102 140 110 180 95 L184 102 C144 118 102 110 100 110 C98 110 56 118 16 102 Z"
                      fill="#064e3b"
                    />

                    {/* Left Wing Pages */}
                    <path d="M100 96 C70 96 32 86 22 78 L25 90 C35 98 70 104 100 102 Z" fill="#a7f3d0" />
                    <path d="M100 92 C72 92 36 82 25 74 L27 82 C37 90 72 98 100 96 Z" fill="#d1fae5" />
                    <path
                      d="M100 88 C74 88 40 78 28 68 L30 74 C40 82 74 92 100 92 Z"
                      fill="#ffffff"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <line x1="42" y1="74" x2="88" y2="82" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="44" y1="78" x2="86" y2="86" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Right Wing Pages */}
                    <path d="M100 96 C130 96 168 86 178 78 L175 90 C165 98 130 104 100 102 Z" fill="#a7f3d0" />
                    <path d="M100 92 C128 92 164 82 175 74 L173 82 C163 90 128 98 100 96 Z" fill="#d1fae5" />
                    <path
                      d="M100 88 C126 88 160 78 172 68 L170 74 C160 82 126 92 100 92 Z"
                      fill="#ffffff"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <line x1="112" y1="82" x2="158" y2="74" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="114" y1="86" x2="156" y2="78" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Chess Piece Emerging from Spine */}
                    <path d="M96 24 C96 20 104 20 104 24 L106 28 H94 Z" fill="#047857" />
                    <circle cx="100" cy="18" r="3" fill="#10b981" />
                    <path
                      d="M93 28 C88 38 90 48 94 56 C94 62 92 68 88 74 H112 C108 68 106 62 106 56 C110 48 112 38 107 28 Z"
                      fill="#065f46"
                      stroke="#047857"
                      strokeWidth="1"
                    />
                    <path d="M86 74 H114 V80 C114 82 110 84 100 84 C90 84 86 82 86 80 Z" fill="#064e3b" />
                    <rect x="88" y="78" width="24" height="2" rx="1" fill="#34d399" />
                  </svg>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                No strategies in your playbook
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md font-medium leading-relaxed">
                Define your trading systems so you can tag each trade and identify which models generate consistent profit.
              </p>

              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20 transition-all hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Strategy</span>
                <span className="font-bold">&gt;</span>
              </button>
            </div>

            {/* Bottom Feature Strip (4 items) */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-4 shadow-xs select-none">
              {/* Ascending Bar Chart Watermark on Right */}
              <svg
                className="absolute right-4 bottom-0 h-14 w-28 pointer-events-none opacity-20 dark:opacity-5 text-emerald-600"
                viewBox="0 0 120 60"
                fill="currentColor"
              >
                <rect x="10" y="35" width="12" height="25" rx="2" />
                <rect x="30" y="25" width="12" height="35" rx="2" />
                <rect x="50" y="15" width="12" height="45" rx="2" />
                <rect x="70" y="5" width="12" height="55" rx="2" />
                <rect x="90" y="0" width="12" height="60" rx="2" />
              </svg>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 dark:divide-slate-800 gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:px-4 py-1.5 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Track Performance</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Measure results per setup</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0 py-1.5 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Optimize Your Edge</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Improve with real data</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0 py-1.5 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <BookOpen className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Build Your Playbook</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Turn ideas into a system</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0 py-1.5 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <Trophy className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Achieve Consistency</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Trade with confidence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {strategyStats.map((strat) => (
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
            ))}
          </div>
        )}

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

