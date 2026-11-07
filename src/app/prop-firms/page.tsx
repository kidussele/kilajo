'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import {
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Target,
  Clock,
  Calendar,
  Sparkles,
  Award,
  Trophy,
  Zap,
  DollarSign,
  Shield,
  Settings,
  ShieldCheck,
  TrendingUp,
  Lock,
} from 'lucide-react'

export default function PropFirmPage() {
  const { accounts, propRules, updatePropRule, activeAccountId } = useTrading()

  // Filter prop firm accounts
  const propAccounts = accounts.filter((a) => a.is_prop_firm)

  const [ruleModalOpen, setRuleModalOpen] = useState(false)
  const [selectedAccountForRules, setSelectedAccountForRules] = useState<string | null>(null)

  // Configure modal fields
  const [profitTargetPct, setProfitTargetPct] = useState('10.0')
  const [dailyLossLimitPct, setDailyLossLimitPct] = useState('5.0')
  const [maxLossLimitPct, setMaxLossLimitPct] = useState('10.0')
  const [minTradingDays, setMinTradingDays] = useState('4')

  const handleOpenRules = (accId: string) => {
    setSelectedAccountForRules(accId)
    const existingRule = propRules.find((r) => r.account_id === accId)
    if (existingRule) {
      setProfitTargetPct(String(existingRule.profit_target_pct))
      setDailyLossLimitPct(String(existingRule.daily_loss_limit_pct))
      setMaxLossLimitPct(String(existingRule.max_loss_limit_pct))
      setMinTradingDays(String(existingRule.min_trading_days))
    }
    setRuleModalOpen(true)
  }

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccountForRules) return

    updatePropRule(selectedAccountForRules, {
      profit_target_pct: parseFloat(profitTargetPct) || 10,
      daily_loss_limit_pct: parseFloat(dailyLossLimitPct) || 5,
      max_loss_limit_pct: parseFloat(maxLossLimitPct) || 10,
      min_trading_days: parseInt(minTradingDays) || 4,
    })

    setRuleModalOpen(false)
  }

  const totalPropCapital = propAccounts.reduce((sum, a) => sum + Number(a.initial_balance || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Prop Firm Challenge Tracker"
          subtitle="Live monitoring of evaluation targets, daily loss guards, and maximum drawdown buffers"
          icon={Trophy}
          quote="Protect your capital first; profits will follow."
        />

        {/* Prop Firm Overview Cards with Action Arrows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Active Challenges"
            value={propAccounts.length.toString()}
            subtitle="Track your active challenges"
            icon={Zap}
            color="emerald"
            actionArrow
          />
          <MetricCard
            title="Total Challenge Capital"
            value={formatCurrency(totalPropCapital, 'USD')}
            subtitle="Combined starting balance"
            icon={DollarSign}
            color="teal"
            actionArrow
          />
          <MetricCard
            title="Phase 1 Targets"
            value="10.0%"
            subtitle="Standard profit milestone"
            icon={Target}
            color="blue"
            actionArrow
          />
          <MetricCard
            title="Max Drawdown Cap"
            value="10.0%"
            subtitle="Hard breach boundary"
            icon={Shield}
            color="purple"
            actionArrow
          />
        </div>

        {propAccounts.length === 0 ? (
          <div className="space-y-5">
            {/* Main Empty State Container */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300/80 bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-emerald-50/50 p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs">
              {/* Soft wave decorations at the bottom */}
              <div className="absolute -bottom-2 -left-2 -right-2 h-16 pointer-events-none opacity-40">
                <svg className="w-full h-full" viewBox="0 0 600 60" preserveAspectRatio="none">
                  <path d="M0,40 C150,15 350,60 600,30 L600,60 L0,60 Z" fill="#10b981" fillOpacity="0.12" />
                  <path d="M0,50 C200,30 400,65 600,45 L600,60 L0,60 Z" fill="#059669" fillOpacity="0.18" />
                </svg>
              </div>

              {/* Golden Trophy with Laurel Leaves Illustration */}
              <div className="relative mb-3 flex items-center justify-center">
                {/* Soft Candlestick Watermark Behind Trophy */}
                <svg
                  className="absolute -top-4 h-28 w-72 pointer-events-none opacity-25 text-emerald-500"
                  viewBox="0 0 200 80"
                  fill="currentColor"
                >
                  <rect x="20" y="30" width="4" height="25" rx="1" />
                  <line x1="22" y1="20" x2="22" y2="60" stroke="currentColor" strokeWidth="1" />
                  <rect x="40" y="20" width="4" height="35" rx="1" />
                  <line x1="42" y1="10" x2="42" y2="65" stroke="currentColor" strokeWidth="1" />
                  <rect x="60" y="35" width="4" height="20" rx="1" />
                  <line x1="62" y1="25" x2="62" y2="60" stroke="currentColor" strokeWidth="1" />
                  <rect x="140" y="25" width="4" height="30" rx="1" />
                  <line x1="142" y1="15" x2="142" y2="65" stroke="currentColor" strokeWidth="1" />
                  <rect x="160" y="15" width="4" height="40" rx="1" />
                  <line x1="162" y1="5" x2="162" y2="70" stroke="currentColor" strokeWidth="1" />
                  <rect x="180" y="30" width="4" height="25" rx="1" />
                  <line x1="182" y1="20" x2="182" y2="65" stroke="currentColor" strokeWidth="1" />
                </svg>

                {/* Laurel Leaves + Trophy */}
                <div className="relative flex items-center justify-center">
                  {/* Left Laurel Leaves */}
                  <svg className="h-20 w-12 text-emerald-600 -mr-2" viewBox="0 0 40 80" fill="currentColor">
                    <path d="M35 70 C20 60 10 40 15 15 C12 25 10 38 15 50 C18 58 25 66 35 70 Z" />
                    <path d="M12 20 C6 22 2 28 4 33 C6 38 12 36 14 30 Z" />
                    <path d="M14 34 C8 37 5 44 8 48 C11 52 17 50 17 43 Z" />
                    <path d="M18 48 C14 52 12 60 16 63 C20 66 24 62 23 55 Z" />
                    <path d="M16 12 C13 7 7 6 5 10 C3 14 8 18 13 18 Z" />
                  </svg>

                  {/* Golden Trophy */}
                  <div className="relative flex flex-col items-center">
                    <svg className="h-24 w-24 drop-shadow-md" viewBox="0 0 80 80" fill="none">
                      <path d="M22 26 C12 26 12 42 24 45" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                      <path d="M58 26 C68 26 68 42 56 45" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                      <path d="M22 20 H58 V36 C58 46 50 54 40 54 C30 54 22 46 22 36 V20 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2.5" />
                      <path d="M40 28 L42 33 L47 33.5 L43 37 L44.5 42 L40 39 L35.5 42 L37 37 L33 33.5 L38 33 Z" fill="#fef3c7" />
                      <path d="M36 54 H44 V62 H36 Z" fill="#f59e0b" />
                      <rect x="28" y="62" width="24" height="6" rx="2" fill="#047857" stroke="#065f46" strokeWidth="1.5" />
                      <rect x="32" y="65" width="16" height="2" rx="0.5" fill="#34d399" />
                    </svg>
                  </div>

                  {/* Right Laurel Leaves */}
                  <svg className="h-20 w-12 text-emerald-600 -ml-2" viewBox="0 0 40 80" fill="currentColor">
                    <path d="M5 70 C20 60 30 40 25 15 C28 25 30 38 25 50 C22 58 15 66 5 70 Z" />
                    <path d="M28 20 C34 22 38 28 36 33 C34 38 28 36 26 30 Z" />
                    <path d="M26 34 C32 37 35 44 32 48 C29 52 23 50 23 43 Z" />
                    <path d="M22 48 C26 52 28 60 24 63 C20 66 16 62 17 55 Z" />
                    <path d="M24 12 C27 7 33 6 35 10 C37 14 32 18 27 18 Z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 tracking-tight">
                No active prop firm challenges
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md font-medium leading-relaxed">
                Create an account with your Prop Firm Challenge, flag enabled to track your evaluation rules.
              </p>

              <button
                onClick={() => (window.location.href = '/accounts')}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
              >
                <Settings className="h-4 w-4" />
                <span>Configure Account</span>
                <span className="font-bold">&gt;</span>
              </button>
            </div>

            {/* Bottom Feature Strip */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 p-4 shadow-xs select-none">
              {/* Ascending Bar Chart Watermark */}
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

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:px-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Stay on Track</p>
                    <p className="text-[11px] text-slate-500 font-medium">Monitor your challenge rules in real-time</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <TrendingUp className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Track Performance</p>
                    <p className="text-[11px] text-slate-500 font-medium">Analyze your progress and results</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <Lock className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Trade with Confidence</p>
                    <p className="text-[11px] text-slate-500 font-medium">Follow the rules. Achieve your goals.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {propAccounts.map((account) => {
              const rule = propRules.find((r) => r.account_id === account.id) || {
                profit_target_pct: 10.0,
                daily_loss_limit_pct: 5.0,
                max_loss_limit_pct: 10.0,
                min_trading_days: 4,
                phase: 1,
                status: 'ACTIVE',
              }

              const initial = Number(account.initial_balance)
              const current = Number(account.current_balance)
              const pnl = current - initial

              // Targets & limits
              const profitTargetAmount = initial * (rule.profit_target_pct / 100)
              const targetBalance = initial + profitTargetAmount
              const remainingToTarget = Math.max(0, targetBalance - current)
              const targetProgressPct = Math.min(100, Math.max(0, (pnl / profitTargetAmount) * 100))

              const dailyLossLimitAmount = initial * (rule.daily_loss_limit_pct / 100)
              const maxLossLimitAmount = initial * (rule.max_loss_limit_pct / 100)
              const minAllowedBalance = initial - maxLossLimitAmount
              const currentDrawdownBuffer = Math.max(0, current - minAllowedBalance)
              const drawdownBufferPct = (currentDrawdownBuffer / maxLossLimitAmount) * 100

              const isBreached = current < minAllowedBalance
              const isTargetReached = current >= targetBalance

              return (
                <Card key={account.id} className="shadow-xs overflow-hidden">
                  <CardHeader className="bg-muted/20 border-b pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold font-mono text-foreground">
                            {account.name}
                          </CardTitle>
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded">
                            {account.broker} • Phase {rule.phase}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Initial Capital: {formatCurrency(initial, account.currency)} • Platform: {account.platform}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isBreached ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            CHALLENGE BREACHED
                          </span>
                        ) : isTargetReached ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded">
                            <Award className="h-3.5 w-3.5" />
                            TARGET PASSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded">
                            <Clock className="h-3.5 w-3.5" />
                            EVALUATION ACTIVE
                          </span>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRules(account.id)}
                          className="text-xs"
                        >
                          Edit Rules
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Primary Progress Gauges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Profit Target Progress */}
                      <div className="space-y-2 border rounded-xl p-4 bg-card">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-emerald-600" />
                            Profit Target (+{rule.profit_target_pct}%)
                          </span>
                          <span className="font-mono font-bold text-emerald-600">
                            {targetProgressPct.toFixed(1)}% Complete
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${targetProgressPct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                          <span>
                            Current Profit: <strong className="text-foreground">{formatCurrency(pnl, account.currency, true)}</strong>
                          </span>
                          <span>
                            Remaining: <strong className="text-foreground">{formatCurrency(remainingToTarget, account.currency)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Max Drawdown Allowance */}
                      <div className="space-y-2 border rounded-xl p-4 bg-card">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                            Maximum Loss Buffer (-{rule.max_loss_limit_pct}%)
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {formatCurrency(currentDrawdownBuffer, account.currency)} left
                          </span>
                        </div>

                        {/* Buffer Bar */}
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              drawdownBufferPct > 50 ? 'bg-emerald-500' : drawdownBufferPct > 25 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, drawdownBufferPct))}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                          <span>
                            Liquidation Price: <strong className="text-red-600">{formatCurrency(minAllowedBalance, account.currency)}</strong>
                          </span>
                          <span>
                            Max Loss Cap: <strong className="text-foreground">-{formatCurrency(maxLossLimitAmount, account.currency)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Limits Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg border bg-muted/10">
                        <span className="text-muted-foreground block text-[11px]">Current Balance</span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          {formatCurrency(current, account.currency)}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/10">
                        <span className="text-muted-foreground block text-[11px]">Daily Loss Limit</span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          -{formatCurrency(dailyLossLimitAmount, account.currency)} ({rule.daily_loss_limit_pct}%)
                        </span>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/10">
                        <span className="text-muted-foreground block text-[11px]">Min Trading Days</span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          {rule.min_trading_days} Days Required
                        </span>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/10">
                        <span className="text-muted-foreground block text-[11px]">Evaluation Status</span>
                        <span className="font-mono text-sm font-bold text-emerald-600">
                          {isBreached ? 'Breached' : isTargetReached ? 'Passed' : 'Compliant'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Edit Rules Modal */}
        {ruleModalOpen && (
          <Modal
            isOpen={ruleModalOpen}
            onClose={() => setRuleModalOpen(false)}
            title="Configure Prop Firm Evaluation Rules"
            description="Customize target percentage, daily loss cap, and drawdown limits to match your prop firm agreement."
            maxWidth="md"
          >
            <form onSubmit={handleSaveRules} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Profit Target (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={profitTargetPct}
                  onChange={(e) => setProfitTargetPct(e.target.value)}
                  className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Daily Loss Limit (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyLossLimitPct}
                  onChange={(e) => setDailyLossLimitPct(e.target.value)}
                  className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Maximum Total Loss (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxLossLimitPct}
                  onChange={(e) => setMaxLossLimitPct(e.target.value)}
                  className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Minimum Trading Days *</label>
                <input
                  type="number"
                  value={minTradingDays}
                  onChange={(e) => setMinTradingDays(e.target.value)}
                  className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setRuleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Save Rules
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

