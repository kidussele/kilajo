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
          subtitle="Daily behavioral audits, emotional state calibration, and systematic discipline tracking"
          icon={Brain}
          quote="Master your mind, master the market."
        >
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105"
          >
            <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Log Daily Reflection</span>
          </button>
        </PageHeroBanner>

        {/* Psychology Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Discipline Score"
            value={`${avgDiscipline}/10`}
            subtitle="Rule execution index"
            icon={ShieldCheck}
            color="emerald"
          />
          <MetricCard
            title="Mood Rating"
            value={`${avgMood}/10`}
            subtitle="Emotional calibration"
            icon={Smile}
            color="amber"
          />
          <MetricCard
            title="Avg Sleep Duration"
            value={`${avgSleep}h`}
            subtitle="Rest & focus readiness"
            icon={Moon}
            color="blue"
          />
          <MetricCard
            title="Reflections Logged"
            value={psychologyLogs.length.toString()}
            subtitle="Total journal entries"
            icon={Brain}
            color="purple"
          />
        </div>

        {/* Psychology Journal Feed */}
        <div className="space-y-4">
          {psychologyLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 border border-slate-100 rounded-3xl bg-white shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 mb-3 text-purple-600">
                <Brain className="h-7 w-7 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No psychology reflections logged</h3>
              <p className="text-xs mt-1 max-w-sm text-slate-400">
                A trader's edge lives in their psychology. Record daily mindset checks to correlate emotions with returns.
              </p>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Log First Reflection</span>
              </button>
            </div>
          ) : (
            psychologyLogs.map((log) => (
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
            ))
          )}
        </div>

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

