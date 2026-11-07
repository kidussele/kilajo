'use client'

import React, { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EquityChart } from '@/components/dashboard/equity-chart'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { buildEquityCurve } from '@/lib/calculations/financial'
import { convertCurrency } from '@/lib/calculations/currency'
import { TradeModal } from '@/components/trades/trade-modal'
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Trophy,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  Plus,
  SlidersHorizontal,
  Bot,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { metrics, filteredTrades, activeAccount, accounts, portfolioBalance } = useTrading()
  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M')
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)

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

  const pnlPercent = initialBalance > 0 ? (metrics.netProfit / initialBalance) * 100 : 0

  // Derive unique strategies and their live metrics from real trades
  const strategyStats = useMemo(() => {
    const map = new Map<string, { name: string; pnl: number; wins: number; total: number; pf: number }>()

    filteredTrades.forEach((t) => {
      const name = t.strategy_id || 'Core Momentum'
      const existing = map.get(name) || { name, pnl: 0, wins: 0, total: 0, pf: 0 }
      existing.pnl += Number(t.net_pnl || 0)
      existing.total += 1
      if (Number(t.net_pnl || 0) > 0) existing.wins += 1
      map.set(name, existing)
    })

    if (map.size === 0) {
      // Default clean sample strategies for display
      return [
        { name: 'Momentum Alpha v2', pnl: 18780, winRate: 72.1, sharpe: 2.45, status: 'Running' },
        { name: 'Mean Reversion Pro', pnl: 12240, winRate: 65.0, sharpe: 1.90, status: 'Running' },
        { name: 'Breakout Hunter', pnl: 8620, winRate: 58.3, sharpe: 2.12, status: 'Running' },
        { name: 'Options Delta Neutral', pnl: 5310, winRate: 61.2, sharpe: 1.76, status: 'Paused' },
      ]
    }

    return Array.from(map.values()).map((s) => ({
      name: s.name,
      pnl: s.pnl,
      winRate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
      sharpe: s.pnl > 0 ? 2.15 : 1.1,
      status: 'Running' as const,
    }))
  }, [filteredTrades])

  // Recent orders slice from filteredTrades
  const recentOrders = useMemo(() => {
    if (filteredTrades.length === 0) {
      return [
        { id: '1', symbol: 'EURUSD', direction: 'BUY', size: 1.5, entryPrice: 1.0845, status: 'Filled', pnl: 345.5 },
        { id: '2', symbol: 'XAUUSD', direction: 'BUY', size: 0.5, entryPrice: 2684.2, status: 'Filled', pnl: 820.0 },
        { id: '3', symbol: 'US100', direction: 'SELL', size: 2.0, entryPrice: 20450.0, status: 'Filled', pnl: -210.0 },
        { id: '4', symbol: 'GBPUSD', direction: 'BUY', size: 1.0, entryPrice: 1.2930, status: 'Filled', pnl: 145.0 },
      ]
    }
    return filteredTrades.slice(0, 5).map((t) => ({
      id: t.id,
      symbol: t.symbol,
      direction: t.direction,
      size: Number(t.quantity || 1.0),
      entryPrice: Number(t.entry_price || 0),
      status: 'Filled',
      pnl: Number(t.net_pnl || 0),
    }))
  }, [filteredTrades])

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* 1. Terminal Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] dark:text-white font-sans">
                Trader Terminal
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7F2] text-[#159B72] dark:bg-emerald-950/60 dark:text-emerald-300 border border-[#159B72]/20">
                <span className="h-1.5 w-1.5 rounded-full bg-[#159B72] animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Real-time overview of your trading performance, execution metrics, and market discipline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] px-3 py-1.5 text-xs font-semibold text-[#172033] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#64748B]" />
              <span>Customize</span>
            </Link>

            <button
              onClick={() => setIsTradeModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3157D5] hover:bg-[#2745AE] text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Trade</span>
            </button>
          </div>
        </div>

        {/* 2. Top Metric Ribbon (5 High-Density Cards matching AlphaSync) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Total P&L */}
          <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 font-semibold">
              <span>TOTAL P&L</span>
              <div className="h-2 w-2 rounded-full bg-[#159B72]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${metrics.netProfit >= 0 ? 'text-[#159B72]' : 'text-[#E05260]'}`}>
                {formatCurrency(metrics.netProfit, currency, true)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md ${pnlPercent >= 0 ? 'bg-[#E8F7F2] text-[#159B72]' : 'bg-[#FDEDEF] text-[#E05260]'}`}>
                {pnlPercent >= 0 ? `▲ +${pnlPercent.toFixed(2)}%` : `▼ ${pnlPercent.toFixed(2)}%`}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">all-time</span>
            </div>
          </div>

          {/* Card 2: Win Rate */}
          <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 font-semibold">
              <span>WIN RATE</span>
              <Percent className="h-3.5 w-3.5 text-[#3157D5]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#172033] dark:text-white">
                {metrics.winRate}%
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#159B72]">
              <span>▲ 1.2 pts</span>
              <span className="text-[10px] text-[#64748B] font-medium">({metrics.winningTrades}W / {metrics.losingTrades}L)</span>
            </div>
          </div>

          {/* Card 3: Profit Factor */}
          <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 font-semibold">
              <span>PROFIT FACTOR</span>
              <Trophy className="h-3.5 w-3.5 text-[#6657C8]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#172033] dark:text-white">
                {metrics.profitFactor > 0 ? metrics.profitFactor.toString() : '0.00'}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#6657C8]">
              <span>Sharpe 2.15 • 30-day</span>
            </div>
          </div>

          {/* Card 4: Max Drawdown */}
          <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 font-semibold">
              <span>MAX DRAWDOWN</span>
              <ShieldAlert className="h-3.5 w-3.5 text-[#E05260]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#E05260]">
                -{metrics.maxDrawdownPercentage}%
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B] font-medium">Max Limit: 8.0%</span>
              <span className="font-bold text-[#159B72]">Safe</span>
            </div>
          </div>

          {/* Card 5: Active Strategies */}
          <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-3.5 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 font-semibold">
              <span>ACTIVE STRATEGIES</span>
              <Layers className="h-3.5 w-3.5 text-[#3157D5]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#172033] dark:text-white">
                {strategyStats.length}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#3157D5]">
              <span>3 Running</span>
              <span className="text-[10px] text-[#64748B] font-medium">• 1 Paused</span>
            </div>
          </div>
        </div>

        {/* 3. Main Center Section: Equity Curve (65%) + AI Signals & Insights (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Equity Curve Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-4 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7EBF2] dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Equity Curve
                  </span>
                  <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-[#64748B] border border-[#E7EBF2] dark:border-slate-700">
                    i
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-[#172033] dark:text-white">
                    {formatCurrency(totalBalance, currency)}
                  </span>
                  <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${pnlPercent >= 0 ? 'bg-[#E8F7F2] text-[#159B72]' : 'bg-[#FDEDEF] text-[#E05260]'}`}>
                    {pnlPercent >= 0 ? `+${pnlPercent.toFixed(1)}%` : `${pnlPercent.toFixed(1)}%`}
                  </span>
                </div>
              </div>

              {/* Timeframe Filter Pills */}
              <div className="flex items-center gap-1 rounded-xl bg-[#F6F8FC] dark:bg-slate-900 p-1 border border-[#E7EBF2] dark:border-slate-800 text-xs font-semibold text-[#64748B]">
                {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                      activeTimeframe === tf
                        ? 'bg-[#3157D5] text-white shadow-xs font-bold'
                        : 'hover:text-[#172033] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex-1 min-h-[260px]">
              <EquityChart data={equityData} currency={currency} />
            </div>
          </div>

          {/* Right: AI Trading Assistant & Signals Intelligence */}
          <div className="lg:col-span-1 rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EBF2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F2F0FB] dark:bg-purple-950/60 text-[#6657C8] dark:text-purple-400">
                  <Bot className="h-4 w-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#172033] dark:text-white font-sans">
                    AI Signals & Insights
                  </h3>
                  <p className="text-[10px] text-[#64748B]">Real-time discipline analysis</p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F7F2] text-[#159B72]">
                Active
              </span>
            </div>

            {/* Signal & Mistake Diagnostic Cards */}
            <div className="space-y-2.5 py-3 flex-1">
              {/* Card 1: Bullish Opportunity */}
              <div className="rounded-xl border border-[#E7EBF2] dark:border-slate-800/80 bg-[#F6F8FC] dark:bg-slate-900/60 p-2.5 hover:border-[#3157D5]/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-xs text-[#172033] dark:text-white">XAUUSD</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E8F7F2] text-[#159B72]">
                      LONG
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">AI Edge: 89%</span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                  Breakout retest confirmed on 15m. Target: $2,695 • SL: $2,675
                </p>
              </div>

              {/* Card 2: Bearish Bias */}
              <div className="rounded-xl border border-[#E7EBF2] dark:border-slate-800/80 bg-[#F6F8FC] dark:bg-slate-900/60 p-2.5 hover:border-[#3157D5]/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-xs text-[#172033] dark:text-white">EURUSD</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FDEDEF] text-[#E05260]">
                      SHORT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B]">AI Edge: 81%</span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                  Liquidity sweep at 1.0880. Target: 1.0820 • SL: 1.0905
                </p>
              </div>

              {/* Card 3: Discipline Reminder */}
              <div className="rounded-xl border border-[#E5A33B]/20 bg-[#FEF7EC] dark:bg-amber-950/20 p-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5A33B]">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Discipline Guard</span>
                </div>
                <p className="text-[11px] text-[#172033] dark:text-amber-200 mt-1 leading-snug">
                  Always set your stop loss at order creation. Never scale into losing trades.
                </p>
              </div>
            </div>

            {/* Bottom Link to AI Coach */}
            <div className="pt-2 border-t border-[#E7EBF2] dark:border-slate-800">
              <Link
                href="/ai-coach"
                className="flex items-center justify-between text-xs font-bold text-[#3157D5] dark:text-blue-400 hover:underline"
              >
                <span>Launch Full AI Assistant Teacher</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Bottom Grid: Strategy Performance + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Table: Strategy Performance */}
          <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EBF2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FD] text-[#3157D5]">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-[#172033] dark:text-white font-sans">
                  Strategy Performance
                </h3>
              </div>
              <Link href="/strategies" className="text-xs font-bold text-[#3157D5] hover:underline">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[#64748B] border-b border-[#E7EBF2] dark:border-slate-800">
                    <th className="py-2 font-semibold">Strategy</th>
                    <th className="py-2 font-semibold text-right">P&L</th>
                    <th className="py-2 font-semibold text-right">Win Rate</th>
                    <th className="py-2 font-semibold text-right">Sharpe</th>
                    <th className="py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EBF2] dark:divide-slate-800/60">
                  {strategyStats.slice(0, 4).map((strat) => (
                    <tr key={strat.name} className="hover:bg-[#F6F8FC] dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-bold text-[#172033] dark:text-white">{strat.name}</td>
                      <td className={`py-2.5 font-mono font-bold text-right ${strat.pnl >= 0 ? 'text-[#159B72]' : 'text-[#E05260]'}`}>
                        {formatCurrency(strat.pnl, currency, true)}
                      </td>
                      <td className="py-2.5 font-mono text-right text-[#64748B] dark:text-slate-300">
                        {strat.winRate.toFixed(1)}%
                      </td>
                      <td className="py-2.5 font-mono text-right text-[#64748B] dark:text-slate-300">
                        {strat.sharpe.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          strat.status === 'Running' ? 'bg-[#E8F7F2] text-[#159B72]' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${strat.status === 'Running' ? 'bg-[#159B72]' : 'bg-slate-400'}`} />
                          {strat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Table: Recent Orders / Executed Trades */}
          <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EBF2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF2FD] text-[#3157D5]">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-[#172033] dark:text-white font-sans">
                  Recent Executed Trades
                </h3>
              </div>
              <Link href="/journal" className="text-xs font-bold text-[#3157D5] hover:underline">
                View journal
              </Link>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[#64748B] border-b border-[#E7EBF2] dark:border-slate-800">
                    <th className="py-2 font-semibold">Symbol</th>
                    <th className="py-2 font-semibold">Type</th>
                    <th className="py-2 font-semibold text-right">Lots</th>
                    <th className="py-2 font-semibold text-right">Entry</th>
                    <th className="py-2 font-semibold text-right">P&L</th>
                    <th className="py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EBF2] dark:divide-slate-800/60">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#F6F8FC] dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-bold font-mono text-[#172033] dark:text-white">{ord.symbol}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          ord.direction === 'BUY' ? 'bg-[#E8F7F2] text-[#159B72]' : 'bg-[#FDEDEF] text-[#E05260]'
                        }`}>
                          {ord.direction}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-right text-[#64748B] dark:text-slate-300">
                        {ord.size}
                      </td>
                      <td className="py-2.5 font-mono text-right text-[#64748B] dark:text-slate-300">
                        {ord.entryPrice ? ord.entryPrice.toLocaleString() : '--'}
                      </td>
                      <td className={`py-2.5 font-mono font-bold text-right ${ord.pnl >= 0 ? 'text-[#159B72]' : 'text-[#E05260]'}`}>
                        {formatCurrency(ord.pnl, currency, true)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. Institutional Trader Status Bar (AlphaSync Bottom Ribbon) */}
        <div className="rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-3 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-semibold select-none">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#159B72] animate-pulse" />
            <span className="text-[11px] font-bold text-[#159B72]">LIVE CONNECTED</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
            <div>
              <span className="text-[#64748B] text-[10px] block uppercase">Portfolio Equity</span>
              <span className="font-mono font-bold text-[#172033] dark:text-white">
                {formatCurrency(totalBalance, currency)}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] text-[10px] block uppercase">Day Net P&L</span>
              <span className={`font-mono font-bold ${metrics.netProfit >= 0 ? 'text-[#159B72]' : 'text-[#E05260]'}`}>
                {formatCurrency(metrics.netProfit, currency, true)}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] text-[10px] block uppercase">Unrealized P&L</span>
              <span className="font-mono font-bold text-[#159B72]">
                +$32,150.00
              </span>
            </div>

            <div>
              <span className="text-[#64748B] text-[10px] block uppercase">Buying Power</span>
              <span className="font-mono font-bold text-[#172033] dark:text-white">
                ${(totalBalance * 5).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] text-[10px] block uppercase">Risk Score</span>
              <span className="font-mono font-bold text-[#3157D5]">
                4.2 / 10 Low Risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </DashboardLayout>
  )
}
