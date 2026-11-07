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
import {
  Target,
  PlusCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Trophy,
  TrendingUp,
  Star,
  ShieldCheck,
} from 'lucide-react'

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
          subtitle="Set clear objectives for profitability, behavioral discipline, and capital milestones."
          icon={Target}
          quote="Discipline is choosing between what you want now and what you want most."
          middleContent={
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Set New Goal</span>
              <span className="font-bold">&gt;</span>
            </button>
          }
        />

        {/* Goal Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Active Goals"
            value={goals.length.toString()}
            subtitle="Configured milestones"
            icon={Trophy}
            color="emerald"
            infoTooltip
            actionArrow
            onActionClick={() => setIsAddOpen(true)}
          />
          <MetricCard
            title="Achieved"
            value={completedCount.toString()}
            subtitle="Completed targets"
            icon={CheckCircle2}
            color="purple"
            infoTooltip
            actionArrow
          />
          <MetricCard
            title="Monthly Targets"
            value={goals.filter((g) => g.period === 'MONTHLY').length.toString()}
            subtitle="Monthly timeframe"
            icon={Calendar}
            color="blue"
            infoTooltip
            actionArrow
          />
          <MetricCard
            title="Completion Rate"
            value={goals.length > 0 ? `${Math.round((completedCount / goals.length) * 100)}%` : '0%'}
            subtitle="Success index"
            icon={TrendingUp}
            color="amber"
            infoTooltip
            actionArrow
          />
        </div>

        {/* Goals Section */}
        {goals.length === 0 ? (
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

              {/* Center Bullseye Target with Arrow, Trophy, and Sparkle Rising Bars */}
              <div className="relative mb-3 flex items-center justify-center">
                {/* Candlestick Watermark Behind Graphic */}
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
                  <rect x="180" y="20" width="4" height="35" rx="1" />
                  <line x1="182" y1="10" x2="182" y2="65" stroke="currentColor" strokeWidth="1" />
                  <rect x="200" y="15" width="4" height="40" rx="1" />
                  <line x1="202" y1="5" x2="202" y2="70" stroke="currentColor" strokeWidth="1" />
                  <rect x="220" y="30" width="4" height="25" rx="1" />
                  <line x1="222" y1="20" x2="222" y2="65" stroke="currentColor" strokeWidth="1" />
                </svg>

                {/* Composite: Trophy + Target + Rising Bars */}
                <div className="relative flex items-center justify-center gap-3">
                  {/* Left Golden Trophy */}
                  <div className="relative flex flex-col items-center translate-y-2">
                    <svg className="h-16 w-16 drop-shadow-sm" viewBox="0 0 80 80" fill="none">
                      <path d="M22 28 C14 28 14 42 24 44" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                      <path d="M58 28 C66 28 66 42 56 44" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                      <path d="M22 22 H58 V36 C58 46 50 52 40 52 C30 52 22 46 22 36 V22 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                      <path d="M40 29 L41.5 33 L45.5 33.5 L42.5 36.5 L43.5 40.5 L40 38 L36.5 40.5 L37.5 36.5 L34.5 33.5 L38.5 33 Z" fill="#fef3c7" />
                      <path d="M37 52 H43 V58 H37 Z" fill="#f59e0b" />
                      <rect x="30" y="58" width="20" height="5" rx="1.5" fill="#047857" />
                    </svg>
                    <svg className="h-5 w-8 text-emerald-600 -mt-1" viewBox="0 0 40 20" fill="currentColor">
                      <path d="M5 15 C15 5 25 5 35 15 C25 12 15 12 5 15 Z" />
                    </svg>
                  </div>

                  {/* Center Target Bullseye with Struck Arrow */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
                      <circle cx="60" cy="60" r="54" stroke="#059669" strokeWidth="7" fill="#ffffff" className="dark:fill-slate-900" />
                      <circle cx="60" cy="60" r="44" stroke="#10b981" strokeWidth="6" fill="#ecfdf5" className="dark:fill-emerald-950/40" />
                      <circle cx="60" cy="60" r="30" stroke="#059669" strokeWidth="6" fill="#ffffff" className="dark:fill-slate-900" />
                      <circle cx="60" cy="60" r="16" fill="#047857" />
                      <circle cx="60" cy="60" r="7" fill="#ffffff" />
                      <line x1="88" y1="32" x2="63" y2="57" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M84 28 L94 26 L90 36 Z" fill="#047857" />
                      <path d="M89 33 L97 31 L95 41 Z" fill="#059669" />
                    </svg>
                  </div>

                  {/* Right Rising Bars with Sparkle Stars */}
                  <div className="relative flex items-end gap-1.5 translate-y-1">
                    <div className="absolute -top-4 right-1 text-amber-400">
                      <svg className="h-5 w-5 fill-amber-400" viewBox="0 0 24 24">
                        <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
                      </svg>
                    </div>
                    <div className="w-3.5 h-8 bg-emerald-400 rounded-t-md" />
                    <div className="w-3.5 h-13 bg-emerald-500 rounded-t-md" />
                    <div className="w-3.5 h-18 bg-emerald-600 rounded-t-md" />
                  </div>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                No active goals configured
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md font-medium leading-relaxed">
                Top traders set clear goals for their trading journey. Define your targets, track your progress, and achieve more.
              </p>

              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20 transition-all hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Set First Goal</span>
                <span className="font-bold">&gt;</span>
              </button>
            </div>

            {/* Bottom Feature Strip (4 items) */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-4 shadow-xs select-none">
              {/* Ascending Bar Chart Watermark */}
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
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Stay Disciplined</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Follow your plan and goals.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0 py-1.5 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Track Progress</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">See your achievements.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0 py-1.5 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <Star className="h-4 w-4 stroke-[2.5] fill-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Reach Milestones</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Turn goals into success.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0 py-1.5 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <Trophy className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Grow Consistently</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Build a winning mindset.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goals.map((g) => {
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
            })}
          </div>
        )}

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

