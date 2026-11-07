'use client'

import React, { useState } from 'react'
import {
  Menu,
  Briefcase,
  Bell,
  Calendar,
  ChevronDown,
  Check,
  PlusCircle,
} from 'lucide-react'
import { useTrading } from '@/context/trading-context'
import { TradeModal } from '@/components/trades/trade-modal'

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { accounts, activeAccountId, setActiveAccountId, activeAccount, isDemoMode } = useTrading()
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)

  // Current formatted date matching the screenshot aesthetic (e.g. "Nov 5, 2026")
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent backdrop-blur-xs select-none">
        {/* Left Section: Mobile Menu + Account Filter Selector Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-800 shadow-xs cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Account Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2] shrink-0" />
              <span className="max-w-[130px] sm:max-w-[200px] truncate">
                {activeAccountId === 'ALL'
                  ? 'All Accounts'
                  : activeAccount?.name || 'All Accounts'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 stroke-[2.5]" />
            </button>

            {isAccountDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsAccountDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-40 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Scope
                  </div>
                  <button
                    onClick={() => {
                      setActiveAccountId('ALL')
                      setIsAccountDropdownOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                      <span>All Accounts (Unified)</span>
                    </div>
                    {activeAccountId === 'ALL' && <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />}
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Individual Accounts
                  </div>
                  {accounts.length === 0 ? (
                    <div className="px-2.5 py-2 text-xs text-slate-400 italic">
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
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                      >
                        <div className="truncate mr-2">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{acc.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {acc.broker} • {acc.currency}
                          </p>
                        </div>
                        {activeAccountId === acc.id && (
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 font-bold" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Notification Pill + Date Pill + Log Trade Action */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Log Trade Button */}
          <button
            onClick={() => setIsTradeModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:shadow-xs shadow-2xs transition-all cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Log Trade</span>
          </button>

          {/* Notification Bell Pill with Red Badge */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xs transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4 stroke-[2]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
              3
            </span>
          </button>

          {/* Date Selector Pill (in dark forest green bg-[#064e3b]) */}
          <div className="flex items-center gap-2 rounded-xl bg-[#064e3b] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-[#075e46] transition-colors cursor-pointer">
            <Calendar className="h-3.5 w-3.5 text-emerald-300 stroke-[2.2]" />
            <span>{formattedDate}</span>
            <ChevronDown className="h-3 w-3 text-emerald-300 stroke-[2.5]" />
          </div>
        </div>
      </header>

      {/* Demo Mode Notification Ribbon (soft warning if in demo mode) */}
      {isDemoMode && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-mono uppercase font-bold text-[10px] bg-amber-500/20 text-amber-900 px-1.5 py-0.5 rounded-md">
              Demo Mode
            </span>
            <span className="text-[11px] font-medium text-amber-800">
              Viewing sample trading portfolio data.
            </span>
          </div>
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
