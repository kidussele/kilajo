'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { AiDecoratedResponse } from '@/components/ai/ai-decorated-response'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  ShieldAlert,
  Brain,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Trash2,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const PRESET_PROMPTS = [
  {
    icon: AlertTriangle,
    title: 'Audit All My Mistakes',
    prompt: 'Analyze all my recent trades and tell me honestly: what are my biggest systematic mistakes, bad habits, and blind spots?',
    tag: 'Mistake Audit',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Discipline Check',
    prompt: 'Audit my stop loss compliance, risk-to-reward ratios, and tell me if I am risking too much per trade.',
    tag: 'Risk Management',
  },
  {
    icon: Brain,
    title: 'Psychology & Tilt Check',
    prompt: 'Look at my win/loss sequences and timestamps. Can you detect any signs of revenge trading, overtrading, or emotional tilt?',
    tag: 'Psychology',
  },
  {
    icon: Award,
    title: 'Teacher Homework Plan',
    prompt: 'Act as my institutional trading teacher. Give me 3 concrete non-negotiable execution rules for my upcoming week.',
    tag: 'Coaching',
  },
]

export default function AiCoachPage() {
  const { filteredTrades, trades, metrics, activeAccount, portfolioBalance } = useTrading()
  const currency = activeAccount?.currency || portfolioBalance.baseCurrency || 'USD'
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to your AI Trading Assistant & Mentor!**\n\nI am your dedicated institutional risk officer and trading teacher. My job is to analyze your execution data, identify your hidden mistakes, uncover psychological leaks, and guide you toward consistent profitability.\n\nClick **"Run Deep Mistake Diagnostic"** below or ask me any question about your setups, risk rules, or trading psychology.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [auditResult, setAuditResult] = useState<string | null>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [selectedTradeId, setSelectedTradeId] = useState<string>('')
  const [singleTradeResult, setSingleTradeResult] = useState<string | null>(null)
  const [isAnalyzingTrade, setIsAnalyzingTrade] = useState(false)

  // Quick stats summary
  const totalTradesCount = trades.length
  const winRate = metrics?.winRate ?? 0
  const netPnl = metrics?.netProfit ?? 0
  const maxDrawdown = metrics?.maxDrawdownAmount ?? 0

  // Send message to AI assistant
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage
    if (!query.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          userMessage: query,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          summary: {
            totalTrades: totalTradesCount,
            winRate,
            netPnl,
            maxDrawdown,
          },
        }),
      })

      const data = await res.json()
      if (data.reply) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        throw new Error(data.error || 'Failed to get AI response')
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Error**: ${err.message || 'Unable to connect to AI assistant. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // Trigger full portfolio mistake audit
  const handleRunMistakeAudit = async () => {
    setIsAuditing(true)
    setAuditResult(null)

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'audit-mistakes',
          trades,
          summary: {
            totalTrades: totalTradesCount,
            winRate,
            netPnl,
            profitFactor: metrics?.profitFactor ?? 0,
            maxDrawdown,
            avgWin: metrics?.averageWin ?? 0,
            avgLoss: metrics?.averageLoss ?? 0,
          },
        }),
      })

      const data = await res.json()
      if (data.analysis) {
        setAuditResult(data.analysis)
      } else {
        throw new Error(data.error || 'Audit failed')
      }
    } catch (err: any) {
      setAuditResult(`⚠️ **Audit Failed**: ${err.message || 'Could not complete mistake analysis.'}`)
    } finally {
      setIsAuditing(false)
    }
  }

  // Single trade audit
  const handleAnalyzeSelectedTrade = async () => {
    if (!selectedTradeId) return
    const trade = trades.find((t) => t.id === selectedTradeId)
    if (!trade) return

    setIsAnalyzingTrade(true)
    setSingleTradeResult(null)

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-single-trade',
          trade,
        }),
      })

      const data = await res.json()
      if (data.analysis) {
        setSingleTradeResult(data.analysis)
      } else {
        throw new Error(data.error || 'Trade audit failed')
      }
    } catch (err: any) {
      setSingleTradeResult(`⚠️ Error: ${err.message}`)
    } finally {
      setIsAnalyzingTrade(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="AI Trading Assistant & Teacher Helper"
          subtitle="Your institutional risk mentor and performance coach. Uncover hidden mistakes, stop emotional tilt, and master disciplined consistency."
          icon={Bot}
          quote="The market does not defeat you; uncorrected mistakes do."
          middleContent={
            <button
              type="button"
              onClick={handleRunMistakeAudit}
              disabled={isAuditing}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-800 bg-[#064e3b] dark:bg-emerald-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#043c2e] transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>{isAuditing ? 'Analyzing Mistakes...' : 'Run Deep Mistake Diagnostic'}</span>
            </button>
          }
        />

        {/* 2. Top Diagnostic Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="AI Coach Engine"
            value="Gemini 3.8 Flash"
            subtitle="Deep reasoning active"
            icon={Bot}
            color="emerald"
            infoTooltip
          />
          <MetricCard
            title="Journaled Trades"
            value={totalTradesCount.toString()}
            subtitle={`${winRate}% Win Rate`}
            icon={BookOpen}
            color="blue"
            infoTooltip
          />
          <MetricCard
            title="Net Realized P&L"
            value={formatCurrency(netPnl, currency, true)}
            subtitle="Overall performance"
            icon={TrendingUp}
            color={netPnl >= 0 ? 'emerald' : 'rose'}
            infoTooltip
          />
          <MetricCard
            title="Mistake Shield"
            value="Fail-Closed"
            subtitle="Hard risk boundaries"
            icon={ShieldAlert}
            color="purple"
            infoTooltip
          />
        </div>

        {/* 3. Preset Quick Prompts Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_PROMPTS.map((p, idx) => {
            const Icon = p.icon
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.prompt)}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c141c] hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-2xs hover:shadow-xs transition-all text-left cursor-pointer group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {p.tag}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {p.title}
                  </h4>
                </div>
              </button>
            )
          })}
        </div>

        {/* 4. Main Two-Column AI Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Interactive AI Trading Coach Chat */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] shadow-xs flex flex-col h-[700px] overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Kilajo Institutional AI Mentor
                    </h3>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Always online • Ready to review setups & mistakes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      role: 'assistant',
                      content: `🔄 Chat history reset. How can I help you improve your trading discipline today?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex gap-3 max-w-[95%] sm:max-w-[90%]',
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto w-full'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                      m.role === 'user'
                        ? 'bg-slate-800 text-white dark:bg-slate-700'
                        : 'bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-white shadow-xs'
                    )}
                  >
                    {m.role === 'user' ? 'ME' : <Bot className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    {m.role === 'user' ? (
                      <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed bg-[#064e3b] text-white rounded-tr-xs shadow-2xs inline-block max-w-full">
                        {m.content}
                      </div>
                    ) : (
                      <AiDecoratedResponse
                        content={m.content}
                        variant="chat"
                        timestamp={m.timestamp}
                        onAskFollowup={(q) => handleSendMessage(q)}
                      />
                    )}
                    {m.role === 'user' && (
                      <span className="text-[10px] text-slate-400 px-1 block text-right">{m.timestamp}</span>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    <span>Analyzing your trades and compiling feedback...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your AI teacher: 'Why did I lose money on my EURUSD trade yesterday?'"
                className="flex-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Column (5 cols): Automated Mistake Auditor & Single-Trade Critic */}
          <div className="lg:col-span-5 space-y-6">
            {/* 4.1 Automated Deep Mistake Audit Result Box */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Deep Mistake Diagnostic
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Systematic leaks & blindspots audit
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunMistakeAudit}
                  disabled={isAuditing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={cn('h-3 w-3', isAuditing && 'animate-spin text-emerald-600')} />
                  <span>{isAuditing ? 'Auditing...' : 'Run Audit'}</span>
                </button>
              </div>

              {auditResult ? (
                <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
                  <AiDecoratedResponse
                    content={auditResult}
                    title="Deep Mistake Diagnostic Report"
                    variant="card"
                    onAskFollowup={(q) => handleSendMessage(q)}
                  />
                </div>
              ) : (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-3">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      No Audit Generated Yet
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                      Click the button above to let AI review your trades, uncover mistakes, and provide teacher homework.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunMistakeAudit}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#064e3b] text-white text-xs font-semibold shadow-xs hover:bg-[#043c2e] cursor-pointer"
                  >
                    <span>Run Diagnostic Now</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 4.2 Individual Trade AI Critic */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Audit Specific Trade Ticket
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select a logged trade to get an instant AI review
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <select
                  value={selectedTradeId}
                  onChange={(e) => setSelectedTradeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="">-- Choose a Trade from Journal --</option>
                  {trades.slice(0, 25).map((t) => (
                    <option key={t.id} value={t.id}>
                      {formatDate(t.entry_time)} • {t.symbol} ({t.direction}) • PnL:{' '}
                      {formatCurrency(t.net_pnl, currency, true)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAnalyzeSelectedTrade}
                  disabled={!selectedTradeId || isAnalyzingTrade}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-2.5 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <Bot className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isAnalyzingTrade ? 'Critiquing Trade...' : 'Analyze This Trade'}</span>
                </button>

                {singleTradeResult && (
                  <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                    <AiDecoratedResponse
                      content={singleTradeResult}
                      title="Single Trade Execution Critic"
                      variant="card"
                      onAskFollowup={(q) => handleSendMessage(q)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4.3 Teacher Wisdom Card */}
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-emerald-50/70 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="h-4 w-4" />
                <span>Mentor Golden Principle</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "Professional traders do not look for certainty; they execute an edge with predefined risk.
                If you eliminate your top 2 repetitive mistakes, your profitability will naturally double."
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
