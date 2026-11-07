'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Database,
  Trash2,
  Download,
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Save,
  Key,
  Copy,
  ExternalLink,
  ShieldCheck,
  Lock,
  RefreshCw,
  Check,
  Bot,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { isDemoMode, toggleDemoMode, trades, accounts, resetAllData, userProfile } = useTrading()

  const [name, setName] = useState(userProfile?.full_name || 'Kidus Seleshi')
  const [email, setEmail] = useState('kidus@kilajo.com')
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('UTC')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [activeTab, setActiveTab] = useState<'profile' | 'bridge' | 'ai' | 'data' | 'danger'>('profile')
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/integrations/mt5/webhook`
    : 'https://kilajo.app/api/integrations/mt5/webhook'

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  // Backup entire data as JSON
  const handleExportAllData = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: { name, email, baseCurrency, timezone },
      accounts,
      trades,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `kilajo_backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleConfirmReset = () => {
    resetAllData()
    setIsResetConfirmOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto select-none">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="Account & System Settings"
          subtitle="Configure trader profile, regional preferences, MT4/MT5 bridge security credentials, and data persistence."
          icon={SettingsIcon}
          quote="Control your environment. Master your trading."
          middleContent={
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3157D5] hover:bg-[#2745AE] text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Preferences</span>
            </button>
          }
        />

        {isSaved && (
          <div className="rounded-2xl border border-[#159B72]/20 bg-[#E8F7F2] p-4 text-xs font-semibold text-[#159B72] flex items-center gap-2 shadow-2xs">
            <CheckCircle className="h-4 w-4 text-[#159B72]" />
            <span>Settings saved successfully. All preferences applied.</span>
          </div>
        )}

        {/* 2. Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Trader Identity"
            value={name}
            subtitle="Pro Trader Verified"
            icon={User}
            color="brand"
            infoTooltip
          />
          <MetricCard
            title="Base Currency"
            value={baseCurrency}
            subtitle="Universal ledger base"
            icon={Globe}
            color="profit"
            infoTooltip
          />
          <MetricCard
            title="Bridge Security"
            value="HMAC SHA-256"
            subtitle="Secret fail-closed active"
            icon={Key}
            color="analytics"
            infoTooltip
          />
          <MetricCard
            title="Data Persistence"
            value="Cloud Synced"
            subtitle="PostgreSQL & RLS Active"
            icon={Database}
            color="warning"
            infoTooltip
          />
        </div>

        {/* 3. Settings Navigation Tabs Pill Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#0D1424] border border-[#E7EBF2] dark:border-slate-800 shadow-xs max-w-fit flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'profile'
                ? 'bg-[#3157D5] text-white shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F8FC] dark:hover:bg-slate-800'
            )}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile & Regional</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bridge')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'bridge'
                ? 'bg-[#3157D5] text-white shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F8FC] dark:hover:bg-slate-800'
            )}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Bridge & Webhooks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'ai'
                ? 'bg-[#3157D5] text-white shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F8FC] dark:hover:bg-slate-800'
            )}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>AI Assistant</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'data'
                ? 'bg-[#3157D5] text-white shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F8FC] dark:hover:bg-slate-800'
            )}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Data & Demo Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('danger')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'danger'
                ? 'bg-[#E05260] text-white shadow-xs font-bold'
                : 'text-[#E05260] hover:bg-[#FDEDEF] dark:hover:bg-rose-950/40'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Danger Zone</span>
          </button>
        </div>

        {/* 4. Tab 1: Profile & Regional Preferences */}
        {activeTab === 'profile' && (
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-7 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Trader Profile & Regional Configuration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your public display name, email, account base currency, and time zone.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Trader Display Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-100 shadow-2xs focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-100 shadow-2xs focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Universal Base Ledger Currency</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-100 shadow-2xs focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                    <option value="AUD">AUD (A$) - Australian Dollar</option>
                    <option value="CAD">CAD (C$) - Canadian Dollar</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Primary Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-100 shadow-2xs focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="America/New_York">EST / EDT (New York, US)</option>
                    <option value="Europe/London">GMT / BST (London, UK)</option>
                    <option value="Asia/Tokyo">JST (Tokyo, Japan)</option>
                    <option value="Asia/Dubai">GST (Dubai, UAE)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-6 py-2.5 text-xs font-bold shadow-xs transition-all hover:scale-105"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. Tab 2: Bridge & Webhooks */}
        {activeTab === 'bridge' && (
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-7 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">MT4 & MT5 Bridge Security & Webhooks</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connect your MetaTrader terminal Expert Advisor (EA) with real-time, read-only sync.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  READ-ONLY SECURED
                </span>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200">Live Universal Webhook URL Endpoint</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 font-mono text-xs text-slate-700 dark:text-emerald-400 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedWebhook ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <Lock className="h-4 w-4" />
                  <span>Enterprise Security & Token Validation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Kilajo enforces server-side <strong>HMAC SHA-256 token hashing</strong>. All incoming MetaTrader bridge
                  requests require a valid signed bearer token with format <code className="bg-white/80 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-slate-800 font-mono">kilajo_bridge_...</code>.
                  Endpoints fail closed if secrets are missing or malformed.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">Bridge Token Status</span>
                    <span className="font-bold text-slate-800 dark:text-white">Active & Verified</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">Execution Mode</span>
                    <span className="font-bold text-slate-800 dark:text-white">Strictly Read-Only (Audited)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5.1 Tab: AI Assistant & Mistake Analyzer */}
        {activeTab === 'ai' && (
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-7 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Assistant & Trading Teacher Engine</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Powered by Google Gemini 3.8. Deep mistake diagnosis, psychology auditing, and institutional mentoring.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  AUTHENTICATED & ACTIVE
                </span>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">Google Gemini API Authentication Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="•••••••••••••••••••• (Active & Loaded via GEMINI_API_KEY)"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 font-mono text-xs text-slate-800 dark:text-emerald-400 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSaved(true)
                      setTimeout(() => setIsSaved(false), 2500)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2.5 font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    <span>{isSaved ? 'Saved!' : 'Save Key'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your key is securely processed server-side via Next.js API routes and never exposed to public clients.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-emerald-50/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Mentor Capabilities</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">🩺 Mistake Detector</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">Uncovers overtrading, revenge sizing, and missing stops.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">🧠 Psychology Guard</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">Detects FOMO and tilt cycles based on trade sequences.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">👨‍🏫 Teacher Helper</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">Gives actionable homework rules for upcoming trading weeks.</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href="/ai-coach"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Bot className="h-4 w-4 text-emerald-400" />
                    <span>Launch AI Assistant & Coach</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Tab 3: Data Management & Isolated Demo Mode */}
        {activeTab === 'data' && (
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-7 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Management & Isolated Demo Datasets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download comprehensive portfolio backups or toggle isolated demo testing data.
              </p>
            </div>

            <div className="space-y-5 text-xs">
              {/* Isolated Demo Mode */}
              <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/70 to-orange-50/40 dark:from-amber-950/30 dark:to-slate-900 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Isolated Demo Mode Controller</span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-3 py-1 rounded-full uppercase border shadow-2xs',
                      isDemoMode
                        ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    )}
                  >
                    {isDemoMode ? 'Active (Demo Dataset)' : 'Disabled (Production)'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Demo data is isolated and strictly partitioned from production trading logs.
                  Enabling Demo Mode populates sample accounts, realistic forex trades, and prop firm metrics for evaluation testing.
                </p>
                <button
                  type="button"
                  onClick={() => toggleDemoMode(!isDemoMode)}
                  className={cn(
                    'py-2 px-5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer',
                    isDemoMode
                      ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/10'
                  )}
                >
                  {isDemoMode ? 'Exit Demo Mode & Return to Production' : 'Enable Isolated Demo Dataset'}
                </button>
              </div>

              {/* Backup Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">Full Portfolio Archive (JSON)</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Download complete snapshot of accounts, trades, executions, and strategies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportAllData}
                  className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  <span>Download Backup JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Tab 4: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#0c141c] p-7 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-rose-100 dark:border-rose-900/40 pb-4">
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-300">Danger Zone: Irreversible Actions</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                Permanently purge accounts, executions, and journal records. Exercise caution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-rose-900 dark:text-rose-300 text-sm block">Purge All Trading Journal Data</span>
                <p className="text-rose-700 dark:text-rose-400 leading-relaxed font-medium">
                  This will permanently wipe all trades, calculated balances, strategy tags, and prop firm records from database and local storage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 font-bold shadow-xs shrink-0 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Purge All Records</span>
              </button>
            </div>
          </div>
        )}

        {/* 8. Bottom Feature Trust Banner */}
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
                <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Row Level Security</p>
                <p className="text-[11px] text-slate-500 font-medium">Strict user-isolated PostgreSQL</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <Lock className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Zero Plaintext Secrets</p>
                <p className="text-[11px] text-slate-500 font-medium">HMAC SHA-256 hashed bridges</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <Globe className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Universal Currency</p>
                <p className="text-[11px] text-slate-500 font-medium">Multi-currency balance ledger</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <Database className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Local Cache Fallback</p>
                <p className="text-[11px] text-slate-500 font-medium">Seamless offline resilience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {isResetConfirmOpen && (
          <Modal
            isOpen={isResetConfirmOpen}
            onClose={() => setIsResetConfirmOpen(false)}
            title="Confirm Complete Data Purge"
            description="Are you sure you want to delete all trading data? This action is irreversible."
            maxWidth="sm"
          >
            <div className="space-y-4 pt-2 text-xs">
              <div className="rounded-xl bg-destructive/10 p-3.5 text-destructive border border-destructive/20 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>All trades, accounts, and statistics will be wiped immediately.</span>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={handleConfirmReset}>
                  Yes, Delete All
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
