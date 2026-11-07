'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
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
} from 'lucide-react'

export default function SettingsPage() {
  const { isDemoMode, toggleDemoMode, trades, accounts, resetAllData } = useTrading()

  const [name, setName] = useState('Senior Trader')
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('UTC')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isSaved, setIsSaved] = useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  // Backup entire data as JSON
  const handleExportAllData = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
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
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
            APPLICATION SETTINGS
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure profile, currency preferences, timezone, and manage local/cloud data storage
          </p>
        </div>

        {isSaved && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        {/* Profile & Localization */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Trader Profile & Regional Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Trader Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Base Currency</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                    <option value="AUD">AUD (A$) - Australian Dollar</option>
                    <option value="CAD">CAD (C$) - Canadian Dollar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Timezone (Internal UTC Conversion)</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="America/New_York">EST / EDT (New York)</option>
                    <option value="Europe/London">GMT / BST (London)</option>
                    <option value="Asia/Tokyo">JST (Tokyo)</option>
                    <option value="Asia/Dubai">GST (Dubai)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Default Interface Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      const t = e.target.value as 'light' | 'dark'
                      setTheme(t)
                      if (t === 'dark') document.documentElement.classList.add('dark')
                      else document.documentElement.classList.remove('dark')
                    }}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="light">Light Mode (Financial First)</option>
                    <option value="dark">Dark Mode (Terminal)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Mode Isolation Controller */}
        <Card className="shadow-xs border-amber-200 dark:border-amber-900/40">
          <CardHeader className="pb-3 border-b bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Demo Data Mode & Isolation</span>
              </CardTitle>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isDemoMode
                    ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDemoMode ? 'Active' : 'Disabled'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              In accordance with Rule 5 & 6 of KILAJO development standards: Demo data is strictly isolated and never mixed
              with real production records. Enabling Demo Mode loads sample evaluation accounts, realistic forex/indices trades, 
              and mock prop-firm challenges.
            </p>
            <Button
              variant={isDemoMode ? 'outline' : 'default'}
              size="sm"
              onClick={() => toggleDemoMode(!isDemoMode)}
              className="text-xs"
            >
              {isDemoMode ? 'Exit Demo Mode & Return to Production' : 'Enable Isolated Demo Dataset'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Backup & Danger Zone */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span>Data Export & Maintenance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
              <div>
                <span className="font-semibold text-foreground block">Full Portfolio Backup (JSON)</span>
                <p className="text-muted-foreground text-[11px]">
                  Download a comprehensive JSON archive containing all accounts, trades, and configurations.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportAllData} className="gap-1.5 text-xs shrink-0">
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON Archive</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <div>
                <span className="font-semibold text-destructive block">Clear All Journal Records</span>
                <p className="text-muted-foreground text-[11px]">
                  Permanently deletes all logged trades, accounts, and imported records from local storage.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                className="gap-1.5 text-xs shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Purge Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

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
              <div className="rounded-lg bg-destructive/10 p-3 text-destructive border border-destructive/20 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>All trades, accounts, and statistics will be wiped immediately.</span>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleConfirmReset}>
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

