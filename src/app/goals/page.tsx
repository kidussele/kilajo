'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency } from '@/lib/utils'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Target, PlusCircle, CheckCircle2, Clock, Calendar } from 'lucide-react'

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, activeAccount } = useTrading()
  const currency = activeAccount?.currency || 'USD'

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'PROFIT' | 'WIN_RATE' | 'DISCIPLINE' | 'RISK'>('PROFIT')
  const [targetValue, setTargetValue] = useState('5000')
  const [currentValue, setCurrentValue] = useState('0')
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const now = new Date()
    const endDate = new Date(now.getTime() + 30 * 86400000)

    addGoal({
      user_id: 'default-user',
      title: title.trim(),
      type,
      target_value: parseFloat(targetValue) || 1000,
      current_value: parseFloat(currentValue) || 0,
      period,
      start_date: now.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      is_completed: false,
    })

    setTitle('')
    setIsAddOpen(false)
  }

  const completedCount = goals.filter((g) => g.is_completed || g.current_value >= g.target_value).length

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Performance Goals"
          subtitle="Set clear objectives for profitability, behavioral discipline, and capital milestones"
          icon={Target}
          quote="Discipline is choosing between what you want now and what you want most."
        >
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105"
          >
            <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Set New Goal</span>
          </button>
        </PageHeroBanner>

        {/* Goal Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Active Goals"
            value={goals.length.toString()}
            subtitle="Configured milestones"
            icon={Target}
            color="emerald"
          />
          <MetricCard
            title="Achieved"
            value={completedCount.toString()}
            subtitle="Completed targets"
            icon={CheckCircle2}
            color="purple"
          />
          <MetricCard
            title="Monthly Targets"
            value={goals.filter((g) => g.period === 'MONTHLY').length.toString()}
            subtitle="Monthly timeframe"
            icon={Calendar}
            color="blue"
          />
          <MetricCard
            title="Completion Rate"
            value={goals.length > 0 ? `${Math.round((completedCount / goals.length) * 100)}%` : '0%'}
            subtitle="Success index"
            icon={Clock}
            color="amber"
          />
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-400 border border-slate-100 rounded-3xl bg-white shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 mb-3 text-emerald-600">
                <Target className="h-7 w-7 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No active goals configured</h3>
              <p className="text-xs mt-1 max-w-sm text-slate-400">
                Top traders trade with intention. Establish explicit targets for your profit milestones and execution discipline.
              </p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Set First Goal</span>
              </button>
            </div>
          ) : (
            goals.map((g) => {
              const progressPct = Math.min(100, Math.max(0, (g.current_value / g.target_value) * 100))
              const isAchieved = g.current_value >= g.target_value || g.is_completed

              return (
                <Card key={g.id} className="shadow-xs">
                  <CardHeader className="bg-muted/15 border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {g.period} • {g.type}
                        </span>
                        <CardTitle className="text-sm font-bold text-foreground">{g.title}</CardTitle>
                      </div>

                      {isAchieved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" />
                          ACHIEVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                          <Clock className="h-3 w-3" />
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Current Progress:</span>
                      <span className="font-mono font-bold text-foreground">
                        {g.type === 'PROFIT'
                          ? formatCurrency(g.current_value, currency)
                          : `${g.current_value}`}
                        {' / '}
                        {g.type === 'PROFIT'
                          ? formatCurrency(g.target_value, currency)
                          : `${g.target_value}${g.type === 'DISCIPLINE' || g.type === 'WIN_RATE' ? '%' : ''}`}
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAchieved ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[11px] text-muted-foreground border-t">
                      <span>Timeline: {g.start_date} → {g.end_date}</span>
                      <button
                        onClick={() => updateGoal(g.id, { is_completed: !g.is_completed })}
                        className="text-primary hover:underline font-semibold"
                      >
                        {g.is_completed ? 'Mark Active' : 'Mark Completed'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Set Goal Modal */}
        {isAddOpen && (
          <Modal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            title="Set New Trading Goal"
            description="Establish an objective and time horizon to keep your trading focused and disciplined."
            maxWidth="md"
          >
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Generate $5,000 PnL this month"
                  className="w-full rounded border bg-background px-3 py-1.5 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Goal Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="PROFIT">Net Profit ($)</option>
                    <option value="DISCIPLINE">Discipline Score (%)</option>
                    <option value="WIN_RATE">Win Rate (%)</option>
                    <option value="RISK">Risk Compliance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Target Metric Value *</label>
                  <input
                    type="number"
                    step="any"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Starting / Current Value</label>
                  <input
                    type="number"
                    step="any"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Save Goal
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

