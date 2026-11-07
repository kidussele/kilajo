'use client'

import React, { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SecondaryMetricRibbon } from '@/components/dashboard/secondary-metric-ribbon'
import { EquityChart } from '@/components/dashboard/equity-chart'
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { buildEquityCurve, buildDailyPerformance, buildCategoryBreakdown } from '@/lib/calculations/financial'
import { convertCurrency } from '@/lib/calculations/currency'
import {
  Wallet,
  TrendingUp,
  Percent,
  Trophy,
  ShieldCheck,
  BarChart3,
  Scale,
  Clock,
  ArrowUpRight,
  Target,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { metrics, filteredTrades, activeAccount, accounts, portfolioBalance } = useTrading()
  const [activeTimeframe, setActiveTimeframe] = useState('1M')

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

  const pnlPercent = initialBalance > 0 ? (metrics.netProfit / initialBalance) * 100 : 0

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="Portfolio Overview"
          subtitle="Track your performance and stay on top of your trading journey"
          quote="Plan Well, Trade Smart, Grow Steady."
        />

        {/* 2. Primary 6 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <MetricCard
            title="Portfolio Balance"
            value={formatCurrency(totalBalance, currency)}
            trend={totalBalance >= initialBalance ? `▲ +${formatCurrency(totalBalance - initialBalance, currency)} (${formatPercent(pnlPercent)})` : `▼ ${formatCurrency(totalBalance - initialBalance, currency)} (${formatPercent(pnlPercent)})`}
            trendPositive={totalBalance >= initialBalance}
            icon={Wallet}
            color="emerald"
          />

          <MetricCard
            title="Net Profit / Loss"
            value={formatCurrency(metrics.netProfit, currency, true)}
            subtitle={formatPercent(pnlPercent, true)}
            icon={TrendingUp}
            color="purple"
          />

          <MetricCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
            icon={Percent}
            color="amber"
          />

          <MetricCard
            title="Profit Factor"
            value={metrics.profitFactor > 0 ? metrics.profitFactor.toString() : '0'}
            subtitle={metrics.profitFactor > 0 ? `${metrics.profitFactor}x` : '--'}
            icon={Trophy}
            color="blue"
          />

          <MetricCard
            title="Expectancy"
            value={formatCurrency(metrics.expectancy, currency, true)}
            subtitle="Per Trade"
            icon={ShieldCheck}
            color="teal"
          />

          <MetricCard
            title="Max Drawdown"
            value={`-${formatCurrency(metrics.maxDrawdownAmount, currency)}`}
            subtitle={`${metrics.maxDrawdownPercentage}%`}
            icon={BarChart3}
            color="purple"
          />
        </div>

        {/* 3. Secondary Detailed Metric Ribbon */}
        <SecondaryMetricRibbon
          totalTrades={metrics.totalTrades}
          avgRiskReward={metrics.riskRewardRatio > 0 ? `1 : ${metrics.riskRewardRatio}` : '--'}
          totalRewardRisk={metrics.profitFactor > 0 ? `${metrics.profitFactor}` : '--'}
          executionDrawdown={`${metrics.winningTrades}W / ${metrics.losingTrades}L R:R`}
          recoveryFactor={metrics.recoveryFactor || '∞'}
          correlationSwap={formatCurrency(metrics.totalCommissions + metrics.totalSwap, currency)}
        />

        {/* 4. Main Interactive Charts Area (2/3 and 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Cumulative Equity & Balance Curve */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <Scale className="h-4 w-4 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-sm font-sans text-slate-800 dark:text-white">
                  Cumulative Equity & Balance Curve
                </h3>
              </div>

              {/* Timeframe Filter Pills */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-50 dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                      activeTimeframe === tf
                        ? 'bg-[#064e3b] text-white shadow-xs font-bold'
                        : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex-1">
              <EquityChart data={equityData} currency={currency} />
            </div>
          </div>

          {/* Right: Daily Realized P&L */}
          <div className="lg:col-span-1">
            <DailyPnlChart data={dailyData} currency={currency} />
          </div>
        </div>

        {/* 5. Bottom Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Top Traded Instruments */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-200/80 dark:hover:border-slate-700 transition-all duration-200 group">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shadow-2xs group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-4 w-4 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white font-sans">
                  Top Traded Instruments
                </h3>
              </div>

              <Link
                href="/analytics"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all cursor-pointer hover:scale-110 shadow-2xs"
              >
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </div>

            <div className="py-5 min-h-[120px] flex items-center justify-center">
              {symbolBreakdown.length === 0 ? (
                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <div className="flex items-center gap-1 text-emerald-500">
                    <svg className="h-6 w-9 text-emerald-500" viewBox="0 0 36 24" fill="currentColor">
                      <rect x="2" y="10" width="3.5" height="10" rx="0.5" />
                      <line x1="3.75" y1="6" x2="3.75" y2="22" stroke="currentColor" strokeWidth="1.2" />
                      <rect x="11" y="6" width="3.5" height="14" rx="0.5" />
                      <line x1="12.75" y1="2" x2="12.75" y2="22" stroke="currentColor" strokeWidth="1.2" />
                      <rect x="20" y="4" width="3.5" height="12" rx="0.5" />
                      <line x1="21.75" y1="1" x2="21.75" y2="18" stroke="currentColor" strokeWidth="1.2" />
                      <rect x="29" y="8" width="3.5" height="10" rx="0.5" />
                      <line x1="30.75" y1="4" x2="30.75" y2="20" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">No trades yet. Start trading to see your most traded pairs.</span>
                </div>
              ) : (
                <div className="w-full space-y-2.5">
                  {symbolBreakdown.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white font-mono">{item.category}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ({item.tradesCount} trades)
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          item.netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(item.netPnl, currency, true)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Executed Trades */}
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800/90 bg-white dark:bg-[#0c141c] p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-200/80 dark:hover:border-slate-700 transition-all duration-200 group">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 shadow-2xs group-hover:scale-110 transition-transform">
                  <Clock className="h-4 w-4 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white font-sans">
                  Recent Executed Trades
                </h3>
              </div>

              <Link
                href="/journal"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-400 transition-all cursor-pointer hover:scale-110 shadow-2xs"
              >
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </div>

            <div className="py-5 min-h-[120px] flex items-center justify-center">
              {filteredTrades.length === 0 ? (
                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <div className="flex h-10 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-400 border border-purple-200/60 dark:border-purple-800/60 shadow-2xs">
                    <FileText className="h-5 w-5 text-purple-400 stroke-[1.8]" />
                  </div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Your latest trades will appear here once you start trading.</span>
                </div>
              ) : (
                <div className="w-full space-y-2">
                  {filteredTrades.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === 'BUY'
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {t.direction}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white font-mono">{t.symbol}</span>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          Number(t.net_pnl || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(Number(t.net_pnl || 0), currency, true)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
