'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  ShieldAlert,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Edit3,
  Calendar,
  Compass,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Lock,
  ListChecks,
  Sliders,
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { useTrading } from '@/context/trading-context'

export default function TraderPlanPage() {
  const { activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Plan parameters state
  const [maxRiskPerTradePct, setMaxRiskPerTradePct] = useState('1.0')
  const [maxDailyLossPct, setMaxDailyLossPct] = useState('2.5')
  const [dailyProfitGoalPct, setDailyProfitGoalPct] = useState('3.0')
  const [maxConsecutiveLosses, setMaxConsecutiveLosses] = useState('2')
  const [maxOpenTrades, setMaxOpenTrades] = useState('2')
  const [minRiskReward, setMinRiskReward] = useState('1:2.0')
  const [selectedSessions, setSelectedSessions] = useState<string[]>(['London Session', 'New York Session'])
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['EURUSD', 'GBPUSD', 'XAUUSD', 'NAS100'])

  // Checklist states
  const [routineChecks, setRoutineChecks] = useState<{ [key: string]: boolean }>({
    news: true,
    levels: true,
    sizing: true,
    mindset: true,
    hardStop: true,
    beRule: false,
    journalDone: false,
  })

  const toggleCheck = (id: string) => {
    setRoutineChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditModalOpen(false)
  }

  const initialBalance = Number(activeAccount?.current_balance || activeAccount?.initial_balance || 10000)
  const maxDailyLossAmount = initialBalance * (parseFloat(maxDailyLossPct) / 100)
  const dailyProfitGoalAmount = initialBalance * (parseFloat(dailyProfitGoalPct) / 100)

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto select-none">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="Trading Plan & Execution Blueprint"
          subtitle="Define capital protection rules, daily loss guardrails, allowed market sessions, and future roadmap milestones."
          icon={Compass}
          quote="Fail to plan, plan to fail. Execute your rules without emotion."
          middleContent={
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Configure Trading Plan</span>
              <span className="font-bold">&gt;</span>
            </button>
          }
        />

        {/* 2. Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Trading Plan Status"
            value="Active & Enforced"
            subtitle="Daily guardrails enabled"
            icon={ShieldAlert}
            color="emerald"
            infoTooltip
          />
          <MetricCard
            title="Max Daily Loss Cap"
            value={`-${maxDailyLossPct}%`}
            subtitle={formatCurrency(maxDailyLossAmount, currency)}
            icon={Flame}
            color="rose"
            infoTooltip
          />
          <MetricCard
            title="Risk Per Execution"
            value={`${maxRiskPerTradePct}%`}
            subtitle="Fixed position sizing"
            icon={Target}
            color="amber"
            infoTooltip
          />
          <MetricCard
            title="Min Target Edge"
            value={minRiskReward}
            subtitle="Required Risk-to-Reward"
            icon={TrendingUp}
            color="blue"
            infoTooltip
          />
        </div>

        {/* 3. Main Trading Plan Blueprint Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Risk Guardrails & Sessions */}
          <div className="lg:col-span-7 space-y-6">
            {/* 3.1 Capital Preservation Guardrails Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Capital Preservation Guardrails</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Non-negotiable risk rules to protect against drawdown</p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  HARD RULES
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Max Risk Per Trade</span>
                    <span className="font-mono font-bold text-slate-900">{maxRiskPerTradePct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Never risk more than 1% of equity on any single order.</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Daily Stop Loss Limit</span>
                    <span className="font-mono font-bold text-rose-600">-{maxDailyLossPct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Terminal shutdown immediately if daily drawdown is reached.</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Daily Profit Milestone</span>
                    <span className="font-mono font-bold text-emerald-600">+{dailyProfitGoalPct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Protect profits once target is reached; no overtrading.</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Consecutive Loss Rule</span>
                    <span className="font-mono font-bold text-slate-900">{maxConsecutiveLosses} Trades</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Mandatory 2-hour timeout after consecutive losses to prevent tilt.</p>
                </div>
              </div>
            </div>

            {/* 3.2 Market Focus & Session Windows Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Market Focus & Session Windows</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Trade only when liquidity and volatility support your edge</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Active Trading Sessions */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Approved Trading Windows:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50">
                      <div className="flex items-center gap-2 font-bold text-emerald-900">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>London Session</span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-700 font-semibold">07:00 – 11:00 UTC</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-blue-200/80 bg-blue-50/50">
                      <div className="flex items-center gap-2 font-bold text-blue-900">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span>New York Session</span>
                      </div>
                      <span className="font-mono text-[11px] text-blue-700 font-semibold">13:00 – 17:00 UTC</span>
                    </div>
                  </div>
                </div>

                {/* Approved Instruments */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Approved Setup Watchlist:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymbols.map((sym) => (
                      <span
                        key={sym}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 shadow-2xs text-xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Blackout Times Notice */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    <strong>High-Impact News Blackout:</strong> No new executions 15 minutes before or after CPI, NFP, or FOMC rate decisions. Flat positions preferred.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Pre/Post Checklist & Roadmap */}
          <div className="lg:col-span-5 space-y-6">
            {/* 3.3 Daily Discipline Checklist Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Execution Protocol Checklist</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Daily compliance checks for each session</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { id: 'news', label: 'Checked high-impact economic calendar events' },
                  { id: 'levels', label: 'Marked Daily & 4H Key Support / Resistance' },
                  { id: 'sizing', label: 'Position size calculated before order entry' },
                  { id: 'mindset', label: 'Calm & focused mindset (No revenge / fear)' },
                  { id: 'hardStop', label: 'Hard stop-loss set immediately upon execution' },
                  { id: 'beRule', label: 'Trail stop to breakeven only at 1:1.5 R:R' },
                  { id: 'journalDone', label: 'Logged trade screenshots and psychology notes' },
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                      routineChecks[item.id]
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950 font-semibold'
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        routineChecks[item.id]
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      )}
                    >
                      {routineChecks[item.id] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <span className="leading-tight">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3.4 Future Trader Roadmap Milestones Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Trader Growth Roadmap</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Future stages toward funded institutional scale</p>
                </div>
              </div>

              <div className="space-y-3 text-xs relative pl-3 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                <div className="relative flex items-start gap-3 pl-6">
                  <div className="absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Phase 1: Capital Preservation (Current)</span>
                    <p className="text-slate-500 text-[11px]">Strict 1% risk discipline, zero breach days, consistent 45%+ win-rate.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3 pl-6">
                  <div className="absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px] font-bold">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Phase 2: Prop Firm Evaluation Pass</span>
                    <p className="text-slate-500 text-[11px]">Hit 10% Phase 1 and 5% Phase 2 profit milestones under rule limits.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3 pl-6">
                  <div className="absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-slate-700 text-[9px] font-bold">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Phase 3: First Funded Payout</span>
                    <p className="text-slate-500 text-[11px]">Achieve first bi-weekly profit split on 100K live funded capital.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3 pl-6">
                  <div className="absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-slate-700 text-[9px] font-bold">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Phase 4: Multi-Account Portfolio Scale</span>
                    <p className="text-slate-500 text-[11px]">Operate multiple aggregated accounts across brokers with automated bridge.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Feature Trust Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 p-4 shadow-xs select-none">
          <svg
            className="absolute right-4 bottom-0 h-14 w-28 pointer-events-none opacity-20 text-emerald-600"
            viewBox="0 0 120 60"
            fill="currentColor"
          >
            <rect x="10" y="35" width="12" height="25" rx="2" />
            <rect x="30" y="25" width="12" height="35" rx="2" />
            <rect x="50" y="15" width="12" height="45" rx="2" />
            <rect x="70" y="5" width="12" height="55" rx="2" />
            <rect x="90" y="0" width="12" height="60" rx="2" />
          </svg>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:px-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <ShieldAlert className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Risk Guardrails</p>
                <p className="text-[11px] text-slate-500 font-medium">Hard daily stop-loss boundaries</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <Clock className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Session Timing</p>
                <p className="text-[11px] text-slate-500 font-medium">High liquidity window alignment</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <ListChecks className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Routine Checklist</p>
                <p className="text-[11px] text-slate-500 font-medium">Standardized pre/post market audit</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <Target className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Milestone Roadmap</p>
                <p className="text-[11px] text-slate-500 font-medium">Clear stages to funded trader</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Configure Trading Plan Modal */}
        {isEditModalOpen && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Configure Trading Plan & Risk Blueprint"
            description="Adjust your capital protection limits, session windows, and mandatory rules."
            maxWidth="md"
          >
            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Max Risk Per Trade (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxRiskPerTradePct}
                    onChange={(e) => setMaxRiskPerTradePct(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Daily Stop Loss Cap (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxDailyLossPct}
                    onChange={(e) => setMaxDailyLossPct(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-rose-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Daily Profit Goal (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dailyProfitGoalPct}
                    onChange={(e) => setDailyProfitGoalPct(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-emerald-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Consecutive Loss Timeout</label>
                  <select
                    value={maxConsecutiveLosses}
                    onChange={(e) => setMaxConsecutiveLosses(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <option value="1">1 Loss (Conservative)</option>
                    <option value="2">2 Losses (Recommended)</option>
                    <option value="3">3 Losses (Aggressive)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Minimum Required R:R Ratio</label>
                <select
                  value={minRiskReward}
                  onChange={(e) => setMinRiskReward(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono"
                >
                  <option value="1:1.5">1:1.5 (Quick Scalping)</option>
                  <option value="1:2.0">1:2.0 (Standard Edge)</option>
                  <option value="1:2.5">1:2.5 (High Yield)</option>
                  <option value="1:3.0">1:3.0 (Trend Following)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#064e3b] hover:bg-[#043c2e] text-white font-semibold">
                  Save Plan Guardrails
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
