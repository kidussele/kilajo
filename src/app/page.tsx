'use client'

import React, { useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EquityChart } from '@/components/dashboard/equity-chart'
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart'
import { RecentTradesTable } from '@/components/dashboard/recent-trades-table'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { buildEquityCurve, buildDailyPerformance, buildCategoryBreakdown } from '@/lib/calculations/financial'
import { convertCurrency } from '@/lib/calculations/currency'
import {
  Wallet,
  TrendingUp,
  Award,
  Zap,
  Percent,
  Crosshair,
  ShieldCheck,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const { metrics, filteredTrades, activeAccount, activeAccountId, accounts, portfolioBalance } = useTrading()

  const currency = activeAccount?.currency || portfolioBalance.baseCurrency || 'USD'

  // Dynamic portfolio equity calculation with accurate FX conversion
  const totalBalance = useMemo(() => {
    if (activeAccount) {
      return Number(activeAccount.current_balance)
    }
    return portfolioBalance.totalInBaseCurrency || 10000 + metrics.netProfit
  }, [activeAccount, portfolioBalance.totalInBaseCurrency, metrics.netProfit])

  const initialBalance = useMemo(() => {
    if (activeAccount) {
      return Number(activeAccount.initial_balance)
    }
    if (accounts.length > 0) {
      return accounts.reduce(
        (sum, acc) => sum + convertCurrency(Number(acc.initial_balance), acc.currency, currency),
        0
      )
    }
    return 10000
  }, [activeAccount, accounts, currency])

  const equityData = useMemo(() => {
    return buildEquityCurve(filteredTrades, initialBalance)
  }, [filteredTrades, initialBalance])

  const dailyData = useMemo(() => {
    return buildDailyPerformance(filteredTrades)
  }, [filteredTrades])

  const symbolBreakdown = useMemo(() => {
    return buildCategoryBreakdown(filteredTrades, (t) => t.symbol).slice(0, 4)
  }, [filteredTrades])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              PORTFOLIO OVERVIEW
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeAccountId === 'ALL'
                ? 'Aggregated performance across all connected trading accounts & prop challenges'
                : `Active Account: ${activeAccount?.name} (${activeAccount?.broker})`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>All-Time History</span>
            </span>
          </div>
        </div>

        {/* Primary Financial Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="Portfolio Balance"
            value={formatCurrency(totalBalance, currency)}
            subtitle={`Initial: ${formatCurrency(initialBalance, currency)}`}
            icon={Wallet}
            sentiment="neutral"
          />
          <MetricCard
            title="Net Profit / Loss"
            value={formatCurrency(metrics.netProfit, currency, true)}
            subtitle={`Gross: ${formatCurrency(metrics.grossProfit, currency)}`}
            icon={TrendingUp}
            sentiment={metrics.netProfit >= 0 ? 'positive' : 'negative'}
            trend={formatPercent(initialBalance > 0 ? (metrics.netProfit / initialBalance) * 100 : 0, true)}
          />
          <MetricCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L (${metrics.breakevenTrades} BE)`}
            icon={Percent}
            sentiment={metrics.winRate >= 50 ? 'positive' : 'warning'}
          />
          <MetricCard
            title="Profit Factor"
            value={metrics.profitFactor.toString()}
            subtitle={`Losses: -${formatCurrency(metrics.grossLoss, currency)}`}
            icon={Award}
            sentiment={metrics.profitFactor >= 1.5 ? 'positive' : 'neutral'}
          />
          <MetricCard
            title="Expectancy"
            value={formatCurrency(metrics.expectancy, currency, true)}
            subtitle="Per executed trade"
            icon={Zap}
            sentiment={metrics.expectancy >= 0 ? 'positive' : 'negative'}
          />
          <MetricCard
            title="Max Drawdown"
            value={`-${formatCurrency(metrics.maxDrawdownAmount, currency)}`}
            subtitle={`${metrics.maxDrawdownPercentage}% of peak equity`}
            icon={ShieldCheck}
            sentiment={metrics.maxDrawdownPercentage > 8 ? 'negative' : 'neutral'}
          />
        </div>

        {/* Secondary Detailed Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 py-2 px-4 rounded-xl border bg-card/60 shadow-xs text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Total Trades</span>
            <span className="font-mono font-bold text-foreground text-sm">{metrics.totalTrades}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Avg Win / Avg Loss</span>
            <span className="font-mono font-bold text-foreground text-sm">
              <span className="text-emerald-600">+{formatCurrency(metrics.averageWin, currency)}</span> /{' '}
              <span className="text-red-600">-{formatCurrency(metrics.averageLoss, currency)}</span>
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Risk / Reward Ratio</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {metrics.riskRewardRatio > 0 ? `1 : ${metrics.riskRewardRatio}` : '—'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Consecutive Streaks</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {metrics.maxConsecutiveWins}W / {metrics.maxConsecutiveLosses}L max
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Recovery Factor</span>
            <span className="font-mono font-bold text-foreground text-sm">{metrics.recoveryFactor}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Commissions & Swap</span>
            <span className="font-mono font-bold text-muted-foreground text-sm">
              {formatCurrency(metrics.totalCommissions + metrics.totalSwap, currency)}
            </span>
          </div>
        </div>

        {/* Charts Grid: Equity Curve & Daily PnL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono">
                  Cumulative Equity & Balance Curve
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chronological progression of realized account equity
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <EquityChart data={equityData} currency={currency} />
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono">
                Daily Realized P&L
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Net profit and loss distribution by day
              </p>
            </CardHeader>
            <CardContent>
              <DailyPnlChart data={dailyData} currency={currency} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Top Instruments Breakdown + Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Instruments Card */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Top Traded Instruments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {symbolBreakdown.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-6 text-center">
                  No traded instruments recorded yet.
                </p>
              ) : (
                symbolBreakdown.map((item) => (
                  <div key={item.category} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <span className="font-mono font-bold text-xs text-foreground">{item.category}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {item.tradesCount} trades • {item.winRate}% win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          item.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(item.netPnl, currency, true)}
                      </span>
                      <p className="text-[10px] text-muted-foreground">PF: {item.profitFactor}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Trades Table */}
          <Card className="lg:col-span-2 shadow-xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-primary" />
                  <span>Recent Executed Trades</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Latest trading executions logged in KILAJO
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RecentTradesTable trades={filteredTrades} currency={currency} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

