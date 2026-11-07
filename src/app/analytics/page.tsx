'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { buildCategoryBreakdown, buildEquityCurve } from '@/lib/calculations/financial'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import {
  LineChart as LineChartIcon,
  Award,
  Zap,
  ShieldCheck,
  BarChart3,
  PieChart as PieIcon,
  Flame,
  Scale,
} from 'lucide-react'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AnalyticsPage() {
  const { filteredTrades, metrics, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [activeTab, setActiveTab] = useState<'breakdown' | 'behavioral' | 'risk'>('breakdown')

  // Breakdown calculations
  const instrumentBreakdown = useMemo(() => {
    return buildCategoryBreakdown(filteredTrades, (t) => t.symbol)
  }, [filteredTrades])

  const sessionBreakdown = useMemo(() => {
    return buildCategoryBreakdown(filteredTrades, (t) => t.session || 'Unspecified')
  }, [filteredTrades])

  const directionBreakdown = useMemo(() => {
    return buildCategoryBreakdown(filteredTrades, (t) => t.direction)
  }, [filteredTrades])

  const weekdayBreakdown = useMemo(() => {
    return buildCategoryBreakdown(filteredTrades, (t) => {
      const d = new Date(t.exit_time || t.entry_time)
      return isNaN(d.getTime()) ? 'Unknown' : WEEKDAYS[d.getDay()]
    })
  }, [filteredTrades])

  // Behavioral & Mistakes analysis
  const mistakesBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; totalLoss: number }>()
    filteredTrades.forEach((t) => {
      if (t.mistakes && t.mistakes.length > 0) {
        t.mistakes.forEach((m) => {
          const existing = map.get(m) || { count: 0, totalLoss: 0 }
          existing.count++
          if (Number(t.net_pnl) < 0) {
            existing.totalLoss += Math.abs(Number(t.net_pnl))
          }
          map.set(m, existing)
        })
      }
    })
    return Array.from(map.entries())
      .map(([mistake, data]) => ({
        mistake,
        count: data.count,
        totalLoss: Number(data.totalLoss.toFixed(2)),
      }))
      .sort((a, b) => b.totalLoss - a.totalLoss)
  }, [filteredTrades])

  // Emotion breakdown
  const emotionBreakdown = useMemo(() => {
    return buildCategoryBreakdown(filteredTrades, (t) => t.emotion_before || 'Neutral')
  }, [filteredTrades])

  // Win/Loss distribution pie data
  const winLossPieData = [
    { name: 'Wins', value: metrics.winningTrades, fill: '#10b981' },
    { name: 'Losses', value: metrics.losingTrades, fill: '#ef4444' },
    { name: 'Breakeven', value: metrics.breakevenTrades, fill: '#94a3b8' },
  ].filter((d) => d.value > 0)

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Analytics Center"
          subtitle="Deep statistical edge analysis, risk distribution, and behavioral patterns"
          icon={LineChartIcon}
          quote="Know your numbers, master your probability."
        >
          {/* Sub-view navigation tabs */}
          <div className="flex rounded-full border border-slate-200 bg-white/90 p-1 text-xs shadow-2xs">
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                activeTab === 'breakdown'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('behavioral')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                activeTab === 'behavioral'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Psychology
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                activeTab === 'risk'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Risk & Drawdown
            </button>
          </div>
        </PageHeroBanner>

        {/* Key Ratios Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
            icon={Award}
            color="amber"
          />
          <MetricCard
            title="Profit Factor"
            value={metrics.profitFactor > 0 ? metrics.profitFactor.toString() : '0'}
            subtitle={metrics.profitFactor >= 1.5 ? 'Institutional Edge' : 'Developing'}
            icon={Flame}
            color="blue"
          />
          <MetricCard
            title="Expectancy"
            value={formatCurrency(metrics.expectancy, currency, true)}
            subtitle="Per trade executed"
            icon={Zap}
            color="emerald"
          />
          <MetricCard
            title="Max Drawdown"
            value={`-${formatCurrency(metrics.maxDrawdownAmount, currency)}`}
            subtitle={`${metrics.maxDrawdownPercentage}%`}
            icon={ShieldCheck}
            color="indigo"
          />
          <MetricCard
            title="Avg Win / Loss"
            value={metrics.averageLoss > 0 ? (metrics.averageWin / metrics.averageLoss).toFixed(2) : '--'}
            subtitle="Payoff ratio"
            icon={Scale}
            color="teal"
          />
          <MetricCard
            title="Total Volume"
            value={`${metrics.totalTrades} Trades`}
            subtitle="Closed executions"
            icon={BarChart3}
            color="purple"
          />
        </div>

        {/* TAB 1: Breakdown View */}
        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            {/* Charts Row: Session P&L and Win/Loss Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>Net Performance by Session</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload
                            return (
                              <div className="rounded-md border bg-popover p-2 text-xs font-sans shadow-md">
                                <p className="font-bold">{d.category} Session</p>
                                <p className="text-emerald-600 font-mono">Net PnL: {formatCurrency(d.netPnl, currency, true)}</p>
                                <p className="text-muted-foreground">{d.tradesCount} trades • {d.winRate}% Win Rate</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                        {sessionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Win/Loss Pie Chart */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
                    <PieIcon className="h-4 w-4 text-primary" />
                    <span>Trade Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex flex-col items-center justify-center">
                  {winLossPieData.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No closed trades yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={winLossPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {winLossPieData.map((entry, index) => (
                            <Cell key={`cell-pie-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Wins ({metrics.winningTrades})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Losses ({metrics.losingTrades})
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance by Instrument Table */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono">
                  Detailed Breakdown by Symbol / Instrument
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-muted/40 text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Instrument</th>
                        <th className="py-2.5 px-4">Trades</th>
                        <th className="py-2.5 px-4">Win Rate</th>
                        <th className="py-2.5 px-4">Net P&L</th>
                        <th className="py-2.5 px-4">Profit Factor</th>
                        <th className="py-2.5 px-4 text-right">Avg Trade P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {instrumentBreakdown.map((item) => (
                        <tr key={item.category} className="hover:bg-muted/30">
                          <td className="py-2.5 px-4 font-mono font-bold text-foreground">{item.category}</td>
                          <td className="py-2.5 px-4 font-mono text-muted-foreground">{item.tradesCount}</td>
                          <td className="py-2.5 px-4 font-mono">
                            <span className={item.winRate >= 50 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                              {item.winRate}%
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold">
                            <span className={item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {formatCurrency(item.netPnl, currency, true)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-foreground">{item.profitFactor}</td>
                          <td className="py-2.5 px-4 font-mono text-right font-medium">
                            {formatCurrency(item.averagePnl, currency, true)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Direction & Weekday Breakdowns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Direction */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono">
                    Performance by Direction (Buy vs. Sell)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {directionBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div>
                        <span className="font-bold text-xs font-mono">{item.category}</span>
                        <p className="text-[10px] text-muted-foreground">{item.tradesCount} trades • {item.winRate}% win</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-xs ${item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(item.netPnl, currency, true)}
                        </span>
                        <p className="text-[10px] text-muted-foreground">PF: {item.profitFactor}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* By Weekday */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono">
                    Performance by Day of Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {weekdayBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div>
                        <span className="font-bold text-xs">{item.category}</span>
                        <p className="text-[10px] text-muted-foreground">{item.tradesCount} trades • {item.winRate}% win</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-xs ${item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(item.netPnl, currency, true)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: Behavioral & Psychology View */}
        {activeTab === 'behavioral' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost of Trading Mistakes */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-500" />
                    <span>Financial Impact of Mistakes</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Quantified cumulative losses directly attributed to identified trading mistakes
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {mistakesBreakdown.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-6 text-center">
                      No mistake tags logged. High discipline maintained!
                    </p>
                  ) : (
                    mistakesBreakdown.map((item) => (
                      <div key={item.mistake} className="flex items-center justify-between border-b pb-2.5 last:border-b-0">
                        <div>
                          <span className="font-semibold text-xs text-foreground">{item.mistake}</span>
                          <p className="text-[10px] text-muted-foreground">Occurred {item.count} times</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-red-600">
                            -{formatCurrency(item.totalLoss, currency)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Emotion Before Trade Impact */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    <span>Emotion vs. Trading Edge</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    How your pre-execution psychological state correlates with net returns
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {emotionBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between border-b pb-2.5 last:border-b-0">
                      <div>
                        <span className="font-semibold text-xs text-foreground">{item.category}</span>
                        <p className="text-[10px] text-muted-foreground">{item.tradesCount} executions • {item.winRate}% Win Rate</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-xs ${item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(item.netPnl, currency, true)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: Risk & Drawdown View */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase font-mono text-muted-foreground">
                    Peak Drawdown Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold font-mono text-red-600">
                    -{formatCurrency(metrics.maxDrawdownAmount, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.maxDrawdownPercentage}% drawdown from peak balance
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase font-mono text-muted-foreground">
                    Consecutive Loss Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {metrics.maxConsecutiveLosses} Trades
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current active loss streak: {metrics.consecutiveLosses}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase font-mono text-muted-foreground">
                    Recovery Factor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold font-mono text-emerald-600">
                    {metrics.recoveryFactor}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ratio of cumulative net profit to maximum drawdown
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

