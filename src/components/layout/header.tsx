'use client'

import React, { useState } from 'react'
import {
  Menu,
  PlusCircle,
  Upload,
  Moon,
  Sun,
  ChevronDown,
  Layers,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTrading } from '@/context/trading-context'
import { TradeModal } from '@/components/trades/trade-modal'
import { useRouter } from 'next/navigation'

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const router = useRouter()
  const { accounts, activeAccountId, setActiveAccountId, activeAccount, isDemoMode } = useTrading()
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card/90 px-4 sm:px-6 backdrop-blur-md">
        {/* Left Section: Mobile Menu + Account Filter Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Account Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs sm:text-sm font-medium shadow-xs hover:bg-accent transition-colors"
            >
              <Layers className="h-4 w-4 text-primary shrink-0" />
              <span className="max-w-[150px] sm:max-w-[220px] truncate text-foreground font-semibold">
                {activeAccountId === 'ALL'
                  ? `All Accounts (${accounts.length})`
                  : activeAccount?.name || 'Select Account'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            </button>

            {isAccountDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsAccountDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border bg-popover p-1.5 shadow-lg z-40 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Scope
                  </div>
                  <button
                    onClick={() => {
                      setActiveAccountId('ALL')
                      setIsAccountDropdownOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>All Accounts (Unified Analytics)</span>
                    </div>
                    {activeAccountId === 'ALL' && <Check className="h-3.5 w-3.5 text-primary font-bold" />}
                  </button>

                  <div className="my-1 border-t" />

                  <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Individual Accounts
                  </div>
                  {accounts.length === 0 ? (
                    <div className="px-2.5 py-2 text-xs text-muted-foreground italic">
                      No accounts added yet.
                    </div>
                  ) : (
                    accounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setActiveAccountId(acc.id)
                          setIsAccountDropdownOpen(false)
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs hover:bg-accent transition-colors text-left"
                      >
                        <div className="truncate mr-2">
                          <p className="font-medium text-foreground truncate">{acc.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {acc.broker} • {acc.currency}
                          </p>
                        </div>
                        {activeAccountId === acc.id && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Actions + Theme + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Import Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/import')}
            className="hidden sm:inline-flex gap-1.5 text-xs font-semibold"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import</span>
          </Button>

          {/* New Trade Primary Action */}
          <Button
            size="sm"
            onClick={() => setIsTradeModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Log Trade</span>
          </Button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Demo Mode Notification Ribbon */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 px-4 py-1 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono uppercase font-bold text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded">
              Demo Mode
            </span>
            <span className="text-[11px]">Viewing isolated sample trading data. Production accounts are unaffected.</span>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="text-[11px] hover:underline font-semibold"
          >
            Manage Data
          </button>
        </div>
      )}

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </>
  )
}

