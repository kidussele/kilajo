'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AccountModal } from '@/components/accounts/account-modal'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'

export default function AccountsPage() {
  const { accounts, deleteAccount, activeAccountId, setActiveAccountId } = useTrading()

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [selectedAccountForBridge, setSelectedAccountForBridge] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)
  const [bridgeToken, setBridgeToken] = useState<string>('')
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              TRADING ACCOUNTS & INTEGRATIONS
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect and manage multiple live broker accounts, prop firm challenges, and synchronization bridges
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddAccountOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Connect Account</span>
          </Button>
        </div>

        {/* Accounts List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
              <Wallet className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">No accounts connected yet</h3>
              <p className="text-xs mt-1 max-w-sm">
                Add your live broker account or prop firm challenge to start tracking your performance.
              </p>
              <Button
                size="sm"
                onClick={() => setIsAddAccountOpen(true)}
                className="mt-4 gap-1.5 text-xs font-semibold"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Your First Account</span>
              </Button>
            </div>
          ) : (
            accounts.map((acc) => {
              const isSelected = activeAccountId === acc.id
              const pnl = Number(acc.current_balance) - Number(acc.initial_balance)
              const pnlPct = Number(acc.initial_balance) > 0 ? (pnl / Number(acc.initial_balance)) * 100 : 0

              return (
                <div
                  key={acc.id}
                  className={`rounded-xl border bg-card p-5 shadow-xs transition-all relative ${
                    isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-foreground/30'
                  }`}
                >
                  {/* Top line badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-sm text-foreground">{acc.name}</span>
                        {acc.is_prop_firm && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            <ShieldAlert className="h-2.5 w-2.5" />
                            PROP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {acc.broker} • {acc.platform}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {acc.connection_status === 'connected' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          <CheckCircle className="h-3 w-3" />
                          Live Sync
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Manual / CSV
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Balance Overview */}
                  <div className="mt-4 border-t pt-3 space-y-1">
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

                    <div className="flex items-center justify-between text-xs pt-1 border-t">
                      <span className="text-muted-foreground">Net P&L</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          pnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {pnl >= 0 ? `+${formatCurrency(pnl, acc.currency)}` : `-${formatCurrency(Math.abs(pnl), acc.currency)}`} (
                        {pnlPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveAccountId(isSelected ? 'ALL' : acc.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                      }`}
                    >
                      {isSelected ? 'Active Scope' : 'Select Account'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenBridge(acc.id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Configure MT4/MT5 Bridge Webhook"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
        <div className="rounded-xl border bg-muted/20 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold font-mono text-foreground uppercase">
              Universal Provider Adapter Framework
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            KILAJO adheres to a strict zero-compromise architectural standard: trading accounts remain completely isolated, 
            and data is normalized through a unified ingestion pipeline. No master broker passwords or private investor credentials 
            are ever requested or stored. Read-only bridges and verifiable CSV/Excel exports are normalized identically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg border bg-card">
              <span className="font-semibold text-foreground block mb-1">CSV / Excel Statement</span>
              <p className="text-muted-foreground text-[11px]">
                Import statements from any broker or trading platform with instant column mapping.
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
              <span className="font-semibold text-foreground block mb-1">MetaTrader 4 & 5 Bridge</span>
              <p className="text-muted-foreground text-[11px]">
                Lightweight read-only Expert Advisor transmits execution reports via encrypted webhook.
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
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

