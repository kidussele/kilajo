'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatPercent } from '@/lib/utils'
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              PROP FIRM CHALLENGE TRACKER
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live monitoring of evaluation targets, daily loss guardrails, and maximum drawdown buffers
            </p>
          </div>
        </div>

        {propAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
            <ShieldAlert className="h-10 w-10 text-amber-500/50 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No active prop firm challenges</h3>
            <p className="text-xs mt-1 max-w-sm">
              Create an account with the "Prop Firm Challenge" flag enabled to track your evaluation rules.
            </p>
            <Button
              size="sm"
              onClick={() => (window.location.href = '/accounts')}
              className="mt-4 gap-1.5 text-xs font-semibold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Configure Account</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
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
