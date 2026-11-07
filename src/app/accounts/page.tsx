'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AccountModal } from '@/components/accounts/account-modal'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import {
  Wallet,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Trash2,
  Edit,
  Radio,
  CheckCircle,
  AlertTriangle,
  Key,
  Copy,
  Check,
  Briefcase,
  GraduationCap,
  History,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  ACCOUNT_CATEGORIES,
  getAccountCategory,
  getScopeLabel,
  AccountCategory,
} from '@/lib/accounts/categories'

export default function AccountsPage() {
  const { accounts, deleteAccount, activeAccountId, setActiveAccountId } = useTrading()

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [selectedAccountForBridge, setSelectedAccountForBridge] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)
  const [bridgeToken, setBridgeToken] = useState<string>('')
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)

  // Selected Category filter state
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory>('ALL')

  // Keep selectedCategory synced with activeAccountId if set to category
  React.useEffect(() => {
    if (activeAccountId === 'ALL') {
      setSelectedCategory('ALL')
    } else if (activeAccountId.startsWith('CAT:')) {
      setSelectedCategory(activeAccountId.replace('CAT:', '') as AccountCategory)
    }
  }, [activeAccountId])

  const handleOpenBridge = async (accountId: string) => {
    setSelectedAccountForBridge(accountId)
    setIsGeneratingToken(true)
    try {
      const res = await fetch('/api/integrations/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      })
      const data = await res.json()
      if (data.rawToken) {
        setBridgeToken(data.rawToken)
      } else {
        setBridgeToken(`klj_live_${btoa(accountId).slice(0, 24)}_sec`)
      }
    } catch {
      setBridgeToken(`klj_live_${btoa(accountId).slice(0, 24)}_sec`)
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const handleCopyToken = () => {
    if (bridgeToken) {
      navigator.clipboard.writeText(bridgeToken)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<AccountCategory, number> = {
      ALL: accounts.length,
      DEMO: 0,
      BACKTEST: 0,
      PROP: 0,
      LIVE: 0,
    }
    accounts.forEach((a) => {
      const cat = getAccountCategory(a)
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [accounts])

  // Filter accounts by category
  const filteredAccounts = useMemo(() => {
    if (selectedCategory === 'ALL') return accounts
    return accounts.filter((a) => getAccountCategory(a) === selectedCategory)
  }, [accounts, selectedCategory])

  const totalCapital = filteredAccounts.reduce((sum, acc) => sum + Number(acc.current_balance || 0), 0)
  const propCount = filteredAccounts.filter((a) => a.is_prop_firm).length

  const getCategoryIcon = (catId: AccountCategory) => {
    switch (catId) {
      case 'ALL':
        return Briefcase
      case 'DEMO':
        return GraduationCap
      case 'BACKTEST':
        return History
      case 'PROP':
        return Trophy
      case 'LIVE':
        return Zap
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Trading Accounts"
          subtitle="Connect and organize accounts across Demo Practice, Backtesting, Prop Challenges, and Live Trading"
          icon={Wallet}
          quote="One journal. All brokers. Unified control."
        >
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3157D5] hover:bg-[#2745AE] text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>Connect Account</span>
          </button>
        </PageHeroBanner>

        {/* 5 Explicit Category Filter Pills in Exact Requested Order */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0D1424] border border-[#E7EBF2] dark:border-slate-800 shadow-2xs">
          {ACCOUNT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            const count = categoryCounts[cat.id] || 0
            const Icon = getCategoryIcon(cat.id)

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  if (cat.id === 'ALL') {
                    setActiveAccountId('ALL')
                  } else {
                    setActiveAccountId(`CAT:${cat.id}`)
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3157D5] text-white shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F8FC] dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-[#F6F8FC] dark:bg-slate-800 text-[#64748B] dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Account Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Total Accounts"
            value={filteredAccounts.length.toString()}
            subtitle={
              selectedCategory === 'ALL'
                ? `${propCount} prop challenges`
                : `${categoryCounts[selectedCategory]} in ${selectedCategory}`
            }
            icon={Wallet}
            color="brand"
          />
          <MetricCard
            title="Total Capital"
            value={formatCurrency(totalCapital, 'USD')}
            subtitle={selectedCategory === 'ALL' ? 'Combined equity' : `${getScopeLabel(activeAccountId, accounts)} equity`}
            icon={CheckCircle}
            color="profit"
          />
          <MetricCard
            title="Category Scope"
            value={ACCOUNT_CATEGORIES.find((c) => c.id === selectedCategory)?.shortLabel || 'All'}
            subtitle={ACCOUNT_CATEGORIES.find((c) => c.id === selectedCategory)?.description || 'Unified view'}
            icon={ShieldAlert}
            color="analytics"
          />
          <MetricCard
            title="Active Scope"
            value={getScopeLabel(activeAccountId, accounts)}
            subtitle="Global filter applied"
            icon={Radio}
            color="brand"
          />
        </div>

        {/* Accounts List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#0c141c] shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 mb-3 text-slate-400">
                <Wallet className="h-7 w-7 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                No accounts in {ACCOUNT_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'this category'}
              </h3>
              <p className="text-xs mt-1 max-w-sm text-slate-400">
                Create a new account or select another category from the filter pills above.
              </p>
              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] hover:bg-[#043c2e] text-white px-5 py-2 text-xs font-semibold shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Connect Account</span>
              </button>
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const isSelected = activeAccountId === acc.id
              const pnl = Number(acc.current_balance) - Number(acc.initial_balance)
              const pnlPct = Number(acc.initial_balance) > 0 ? (pnl / Number(acc.initial_balance)) * 100 : 0
              const categoryKey = getAccountCategory(acc)
              const catDef = ACCOUNT_CATEGORIES.find((c) => c.id === categoryKey) || ACCOUNT_CATEGORIES[4]
              const CatIcon = getCategoryIcon(categoryKey)

              return (
                <div
                  key={acc.id}
                  className={`rounded-3xl border bg-white dark:bg-[#0c141c] p-5 shadow-xs transition-all relative ${
                    isSelected ? 'ring-2 ring-[#064e3b] border-[#064e3b]' : 'border-slate-100 dark:border-slate-800 hover:shadow-md'
                  }`}
                >
                  {/* Top line badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{acc.name}</span>
                        {/* Category badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catDef.badgeClass}`}>
                          <CatIcon className="h-2.5 w-2.5" />
                          {catDef.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {acc.broker} • {acc.platform}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {acc.connection_status === 'connected' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Live Sync
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Manual / CSV
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Balance Overview */}
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Current Balance</span>
                      <span className="font-mono text-lg font-bold text-foreground tabular-nums">
                        {formatCurrency(acc.current_balance, acc.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Starting Capital</span>
                      <span className="font-mono text-muted-foreground tabular-nums">
                        {formatCurrency(acc.initial_balance, acc.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-muted-foreground">Net P&L</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {pnl >= 0 ? `+${formatCurrency(pnl, acc.currency)}` : `-${formatCurrency(Math.abs(pnl), acc.currency)}`} (
                        {pnlPct >= 0 ? `+${pnlPct.toFixed(2)}` : pnlPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveAccountId(isSelected ? 'ALL' : acc.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#064e3b] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ Active Scope' : 'Select Scope'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenBridge(acc.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground cursor-pointer"
                        title="Configure MT4/MT5 Bridge Webhook"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Universal Provider Architecture Information Card */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-[#0c141c]/70 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#064e3b] dark:text-emerald-400" />
            <h3 className="text-sm font-bold font-mono text-foreground uppercase">
              Universal Provider Adapter Framework
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            KILAJO adheres to a strict zero-compromise architectural standard: trading accounts remain completely isolated across 
            Demo Practice, Backtesting, Prop Challenges, and Live Trading. Read-only bridges and verifiable CSV/Excel exports are normalized identically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-semibold text-foreground block mb-1">CSV / Excel Statement</span>
              <p className="text-muted-foreground text-[11px]">
                Import statements from any broker or trading platform with instant column mapping.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-semibold text-foreground block mb-1">MetaTrader 4 & 5 Bridge</span>
              <p className="text-muted-foreground text-[11px]">
                Lightweight read-only Expert Advisor transmits execution reports via encrypted webhook.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-semibold text-foreground block mb-1">cTrader / Open API</span>
              <p className="text-muted-foreground text-[11px]">
                Direct read-only statement export and OpenAPI token synchronization.
              </p>
            </div>
          </div>
        </div>

        {/* Bridge Setup Modal */}
        {selectedAccountForBridge && (
          <Modal
            isOpen={!!selectedAccountForBridge}
            onClose={() => setSelectedAccountForBridge(null)}
            title="MetaTrader Bridge Setup & Webhook"
            description="Configure your MT4 or MT5 terminal to push trade executions automatically to KILAJO."
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-secondary/50 border space-y-2">
                <span className="font-semibold text-foreground block">Webhook Endpoint</span>
                <code className="block p-2 rounded bg-background border font-mono text-[11px] text-foreground select-all break-all">
                  https://kilajo.app/api/integrations/mt5/webhook
                </code>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 border space-y-2">
                <span className="font-semibold text-foreground block">Account Sync Token</span>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={bridgeToken}
                    className="w-full rounded border bg-background px-2.5 py-1.5 font-mono text-xs select-all"
                  />
                  <Button size="sm" variant="outline" onClick={handleCopyToken} className="gap-1 text-xs">
                    {copiedToken ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
                <p className="font-medium text-foreground">How to install:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Download the read-only KILAJO EA (`kilajo_bridge.ex5`) from our integration center.</li>
                  <li>In MT5, go to Tools → Options → Expert Advisors → Allow WebRequest for `kilajo.app`.</li>
                  <li>Attach EA to any chart and paste the Sync Token above.</li>
                </ol>
              </div>

              <div className="flex justify-end pt-2 border-t">
                <Button size="sm" onClick={() => setSelectedAccountForBridge(null)}>
                  Done
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Account Modal */}
        <AccountModal
          isOpen={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
        />
      </div>
    </DashboardLayout>
  )
}
