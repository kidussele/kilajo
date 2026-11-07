'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatDate } from '@/lib/utils'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import {
  Brain,
  PlusCircle,
  Sparkles,
  Smile,
  ShieldCheck,
  AlertCircle,
  Moon,
  Calendar,
  BarChart2,
  Activity,
  Hourglass,
  ClipboardCheck,
  Lightbulb,
  Check,
  PenLine,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Trophy,
} from 'lucide-react'

export default function PsychologyPage() {
  const { psychologyLogs, addPsychologyLog } = useTrading()

  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [moodScore, setMoodScore] = useState('8')
  const [disciplineScore, setDisciplineScore] = useState('9')
  const [stressLevel, setStressLevel] = useState('3')
  const [sleepHours, setSleepHours] = useState('7.5')
  const [marketPrepDone, setMarketPrepDone] = useState(true)
  const [lessonsLearned, setLessonsLearned] = useState('')
  const [notes, setNotes] = useState('')

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault()

    addPsychologyLog({
      user_id: 'default-user',
      date,
      mood_score: parseInt(moodScore) || 5,
      discipline_score: parseInt(disciplineScore) || 5,
      stress_level: parseInt(stressLevel) || 3,
      sleep_hours: parseFloat(sleepHours) || 7,
      market_prep_done: marketPrepDone,
      rule_violations: [],
      lessons_learned: lessonsLearned || null,
      notes: notes || null,
    })

    setLessonsLearned('')
    setNotes('')
    setIsLogModalOpen(false)
  }

  const avgDiscipline = psychologyLogs.length > 0 ? (psychologyLogs.reduce((s, l) => s + (l.discipline_score || 0), 0) / psychologyLogs.length).toFixed(1) : '8.5'
  const avgMood = psychologyLogs.length > 0 ? (psychologyLogs.reduce((s, l) => s + (l.mood_score || 0), 0) / psychologyLogs.length).toFixed(1) : '8.0'
  const avgSleep = psychologyLogs.length > 0 ? (psychologyLogs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / psychologyLogs.length).toFixed(1) : '7.5'

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Psychology & Discipline"
          subtitle="Train your mind, control your emotions, and trade with discipline."
          icon={Brain}
          quote="Master your mind, master the market."
          middleContent={
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3157D5] hover:bg-[#2745AE] text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Log Daily Reflection</span>
            </button>
          }
        />

        {/* Psychology Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Discipline Score"
            value="8.5/10"
            trend="▲ +0.2 vs last week"
            trendPositive={true}
            icon={Brain}
            color="brand"
            infoTooltip
          />
          <MetricCard
            title="Mood Rating"
            value="8.0/10"
            trend="▲ +0.1 vs last week"
            trendPositive={true}
            icon={Activity}
            color="profit"
            infoTooltip
          />
          <MetricCard
            title="Avg Sleep Duration"
            value="7.5h"
            trend="▲ +0.3h vs last week"
            trendPositive={true}
            icon={Hourglass}
            color="analytics"
            infoTooltip
          />
          <MetricCard
            title="Reflection Logged"
            value={psychologyLogs.length > 0 ? psychologyLogs.length.toString() : '12'}
            subtitle="This Month"
            icon={ClipboardCheck}
            color="warning"
            infoTooltip
          />
        </div>

        {/* Mind & Discipline Overview Main Section */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-6 sm:p-7 shadow-xs space-y-6">
          {/* Header Strip: Title + Timeframe Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400">
                <svg className="h-4 w-4 fill-[#064e3b] dark:fill-emerald-400" viewBox="0 0 24 24">
                  <path d="M12 2C11 6 7 10 3 11C7 12 11 16 12 20C13 16 17 12 21 11C17 10 13 6 12 2Z" />
                </svg>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Mind & Discipline Overview
              </h2>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] px-3.5 py-1.5 font-semibold text-white shadow-2xs cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Last 30 Days</span>
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Last 90 Days
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors hidden sm:inline-block cursor-pointer"
              >
                Last 6 Months
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                All Time
              </button>
            </div>
          </div>

          {/* 3 Columns: Meditating Trader Illustration | Reflection Empty Box | Mindset Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 4 Cols: Meditating Trader Illustration */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative flex items-center justify-center py-2">
                <svg className="w-56 h-56" viewBox="0 0 240 240" fill="none">
                  {/* Soft aura background */}
                  <circle cx="120" cy="120" r="85" fill="#ecfdf5" className="dark:fill-emerald-950/40" />
                  <circle cx="120" cy="120" r="70" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="3 3" className="dark:stroke-emerald-800/40" />

                  {/* Green Foliage Leaves behind trader */}
                  <g fill="#10b981" opacity="0.9">
                    <path d="M55 150 C40 130 45 105 60 95 C65 115 65 135 55 150 Z" />
                    <path d="M70 170 C50 160 50 135 65 125 C75 140 78 158 70 170 Z" />
                    <path d="M185 150 C200 130 195 105 180 95 C175 115 175 135 185 150 Z" />
                    <path d="M170 170 C190 160 190 135 175 125 C165 140 162 158 170 170 Z" />
                  </g>

                  {/* Meditating Trader Figure */}
                  <circle cx="120" cy="72" r="17" fill="#8d5b4c" />
                  <path d="M103 68 C103 52 137 52 137 68 C137 62 103 62 103 68 Z" fill="#2d1d18" />
                  <circle cx="120" cy="74" r="14" fill="#a26955" />
                  <path d="M112 75 Q115 78 118 75" stroke="#4a2e25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M122 75 Q125 78 128 75" stroke="#4a2e25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M118 82 Q120 84 122 82" stroke="#4a2e25" strokeWidth="1" fill="none" strokeLinecap="round" />
                  <path d="M105 65 C107 55 133 55 135 65 C132 58 108 58 105 65 Z" fill="#1e1310" />

                  {/* White T-Shirt Body */}
                  <path d="M104 90 L136 90 L146 142 L94 142 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                  {/* Kilajo Logo on T-Shirt */}
                  <path d="M113 118 L113 112 M117 118 L117 108 M121 118 L121 104" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  <path d="M123 106 L127 102 M127 102 L127 105 M127 102 L124 102" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Arms in Lotus Mudra */}
                  <path d="M104 92 C88 106 72 128 78 144 C82 152 98 152 104 146" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" fill="none" />
                  <path d="M136 92 C152 106 168 128 162 144 C158 152 142 152 136 146" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" fill="none" />
                  <circle cx="78" cy="146" r="6" fill="#a26955" />
                  <circle cx="162" cy="146" r="6" fill="#a26955" />

                  {/* Green Pants in Lotus Cross-Legged */}
                  <path d="M88 142 C70 152 58 168 76 182 C98 190 142 190 164 182 C182 168 170 152 152 142 Z" fill="#064e3b" />
                  <ellipse cx="98" cy="180" rx="12" ry="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <ellipse cx="142" cy="180" rx="12" ry="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Middle 5 Cols: Dashed Reflection Box */}
            <div className="lg:col-span-5 rounded-3xl border-2 border-dashed border-emerald-300/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:bg-none dark:bg-slate-900/60 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <Brain className="h-7 w-7 stroke-[2]" />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
                  ♥
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No psychology reflections logged yet!
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs font-medium leading-relaxed">
                Take a moment to reflect on your trading journey, mindset, and emotional state.
              </p>

              <button
                onClick={() => setIsLogModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Log First Reflection</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right 3 Cols: Mindset Tips Card */}
            <div className="lg:col-span-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Mindset Tips</h4>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Stay calm during drawdowns.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Follow your trading plan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Control emotions, avoid revenge trading.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Focus on progress, not perfection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Take breaks and enjoy life.</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-xs font-serif italic font-bold text-emerald-700 dark:text-emerald-400">
                  Discipline = Success
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Ribbon (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-4 shadow-xs hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Build Discipline</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Stick to your plan consistently.</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-4 shadow-xs hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Smile className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Manage Emotions</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Trade with a calm mind.</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-4 shadow-xs hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <TrendingUp className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Track Progress</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">See your improvement.</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-4 shadow-xs hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                <Trophy className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Achieve Your Goals</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">With discipline and focus.</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Existing Logs List (when logs are present) */}
        {psychologyLogs.length > 0 && (
          <div className="space-y-4">
            {psychologyLogs.map((log) => (
              <Card key={log.id} className="shadow-xs">
                <CardHeader className="bg-muted/15 border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-bold font-mono text-foreground">
                        {formatDate(log.date)} Daily Review
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Smile className="h-3.5 w-3.5 text-amber-500" />
                        Mood: {log.mood_score}/10
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Discipline: {log.discipline_score}/10
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Moon className="h-3.5 w-3.5" />
                        {log.sleep_hours}h Sleep
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  {log.lessons_learned && (
                    <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 p-3 border border-emerald-200/50">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                        Key Lesson Learned:
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{log.lessons_learned}</p>
                    </div>
                  )}

                  {log.notes && (
                    <div>
                      <span className="font-semibold text-foreground block mb-1">Trading Day Reflections:</span>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{log.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Daily Reflection Modal */}
        {isLogModalOpen && (
          <Modal
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            title="Log Daily Trading Psychology & Reflection"
            description="Audit your emotional state, mental fatigue, and rule compliance."
            maxWidth="md"
          >
            <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Trading Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded border bg-background px-3 py-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Emotional Mood (1-10)</label>
                  <select
                    value={moodScore}
                    onChange={(e) => setMoodScore(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} - {n >= 8 ? 'Optimal / Calm' : n >= 5 ? 'Moderate' : 'Stressed / Tilt'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Discipline Rating (1-10)</label>
                  <select
                    value={disciplineScore}
                    onChange={(e) => setDisciplineScore(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} - {n >= 8 ? 'Followed All Rules' : n >= 5 ? 'Minor Deviations' : 'Ignored Rules'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Stress Level (1-10)</label>
                  <select
                    value={stressLevel}
                    onChange={(e) => setStressLevel(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n} - {n <= 3 ? 'Low Stress' : n <= 6 ? 'Manageable' : 'High Pressure'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Sleep Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prepCheck"
                  checked={marketPrepDone}
                  onChange={(e) => setMarketPrepDone(e.target.checked)}
                  className="rounded border-input text-primary"
                />
                <label htmlFor="prepCheck" className="font-medium text-foreground cursor-pointer">
                  Completed pre-market routine & economic calendar review
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Key Lesson Learned Today</label>
                <textarea
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  rows={2}
                  placeholder="What is one tangible insight you will carry into tomorrow?"
                  className="w-full rounded border bg-background px-3 py-1.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">General Reflections & Thoughts</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes on execution, market flow, or emotions during the session."
                  className="w-full rounded border bg-background px-3 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsLogModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Save Reflection
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

