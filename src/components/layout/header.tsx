'use client'

import React, { useState, useMemo } from 'react'
import {
  Menu,
  Briefcase,
  Bell,
  Calendar,
  ChevronDown,
  Check,
  PlusCircle,
  GraduationCap,
  History,
  Trophy,
  Zap,
  Plus,
} from 'lucide-react'
import { useTrading } from '@/context/trading-context'
import { TradeModal } from '@/components/trades/trade-modal'
import { AccountModal } from '@/components/accounts/account-modal'
import {
  ACCOUNT_CATEGORIES,
  getAccountCategory,
  getScopeLabel,
  AccountCategory,
} from '@/lib/accounts/categories'

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { accounts, activeAccountId, setActiveAccountId, activeAccount, isDemoMode } = useTrading()
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)

  // Current formatted date matching the screenshot aesthetic (e.g. "Nov 5, 2026")
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Group accounts by category
  const accountsByCategory = useMemo(() => {
    const map: Record<'DEMO' | 'BACKTEST' | 'PROP' | 'LIVE', typeof accounts> = {
      DEMO: [],
      BACKTEST: [],
      PROP: [],
      LIVE: [],
    }
    for (const acc of accounts) {
      const cat = getAccountCategory(acc)
      map[cat].push(acc)
    }
    return map
  }, [accounts])

  // Category Icon helper
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

  // Active Category indicator for button
  const currentCategoryIcon = useMemo(() => {
    if (activeAccountId === 'ALL') return Briefcase
    if (activeAccountId === 'CAT:DEMO') return GraduationCap
    if (activeAccountId === 'CAT:BACKTEST') return History
    if (activeAccountId === 'CAT:PROP') return Trophy
    if (activeAccountId === 'CAT:LIVE') return Zap
    if (activeAccount) {
      const cat = getAccountCategory(activeAccount)
      return getCategoryIcon(cat)
    }
    return Briefcase
  }, [activeAccountId, activeAccount])

  const currentScopeTitle = useMemo(() => {
    return getScopeLabel(activeAccountId, accounts)
  }, [activeAccountId, accounts])

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

          {/* Account Selector Pill with Categories */}
          <div className="relative">
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#172033] dark:text-slate-100 shadow-2xs hover:bg-[#F6F8FC] dark:hover:bg-slate-800/80 transition-all cursor-pointer"
            >
              {React.createElement(currentCategoryIcon, {
                className: 'h-4 w-4 text-[#3157D5] dark:text-blue-400 stroke-[2.2] shrink-0',
              })}
              <span className="max-w-[130px] sm:max-w-[200px] truncate">
                {currentScopeTitle}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#64748B] stroke-[2.5]" />
            </button>

            {isAccountDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsAccountDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-80 max-h-[82vh] overflow-y-auto rounded-2xl border border-[#E7EBF2] dark:border-slate-800 bg-white dark:bg-[#0D1424] p-2.5 shadow-xl z-40 animate-in fade-in zoom-in-95 scrollbar-thin">
                  {/* Category Header */}
                  <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-[#E7EBF2] dark:border-slate-800/80 mb-2">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Trading Categories & Accounts
                    </span>
                    <span className="text-[10px] font-semibold text-[#3157D5] dark:text-blue-400 bg-[#EEF2FD] dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                      {accounts.length} Total
                    </span>
                  </div>

                  {/* 1. All Accounts Option */}
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        setActiveAccountId('ALL')
                        setIsAccountDropdownOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        activeAccountId === 'ALL'
                          ? 'bg-[#3157D5] text-white shadow-xs'
                          : 'text-[#172033] dark:text-slate-200 hover:bg-[#EEF2FD] dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${activeAccountId === 'ALL' ? 'bg-white/20' : 'bg-[#EEF2FD] dark:bg-blue-950/50 text-[#3157D5]'}`}>
                          <Briefcase className="h-3.5 w-3.5 stroke-[2.2]" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">All Accounts</p>
                          <p className={`text-[10px] ${activeAccountId === 'ALL' ? 'text-blue-100' : 'text-[#64748B]'}`}>
                            Unified multi-broker portfolio ({accounts.length})
                          </p>
                        </div>
                      </div>
                      {activeAccountId === 'ALL' && <Check className="h-4 w-4 shrink-0 font-bold" />}
                    </button>
                  </div>

                  {/* 2 to 5 Concrete Categories in Requested Order */}
                  <div className="space-y-2">
                    {ACCOUNT_CATEGORIES.filter((c) => c.id !== 'ALL').map((category) => {
                      const catAccounts = accountsByCategory[category.id as 'DEMO' | 'BACKTEST' | 'PROP' | 'LIVE']
                      const isCatActive = activeAccountId === `CAT:${category.id}`
                      const IconComp = getCategoryIcon(category.id)

                      return (
                        <div
                          key={category.id}
                          className="rounded-xl border border-[#E7EBF2] dark:border-slate-800/80 p-2 bg-[#F6F8FC] dark:bg-slate-900/50"
                        >
                          {/* Category Header Row */}
                          <button
                            onClick={() => {
                              setActiveAccountId(`CAT:${category.id}`)
                              setIsAccountDropdownOpen(false)
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              isCatActive
                                ? 'bg-[#172033] text-white dark:bg-slate-700'
                                : 'text-[#172033] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${category.dotClass}`} />
                              <IconComp className="h-3.5 w-3.5" />
                              <span className="font-bold">{category.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#E7EBF2] dark:bg-slate-800 text-[#172033] dark:text-slate-300">
                                {catAccounts.length}
                              </span>
                              {isCatActive && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 font-bold" />}
                            </div>
                          </button>

                          {/* Individual Accounts in this Category */}
                          <div className="mt-1 space-y-0.5 pl-2">
                            {catAccounts.length === 0 ? (
                              <p className="text-[10px] text-[#64748B] italic py-1 pl-2">
                                No accounts configured yet.
                              </p>
                            ) : (
                              catAccounts.map((acc) => {
                                const isAccActive = activeAccountId === acc.id
                                return (
                                  <button
                                    key={acc.id}
                                    onClick={() => {
                                      setActiveAccountId(acc.id)
                                      setIsAccountDropdownOpen(false)
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                                      isAccActive
                                        ? 'bg-[#EEF2FD] dark:bg-blue-950/60 text-[#3157D5] dark:text-blue-200 font-semibold'
                                        : 'text-[#64748B] dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/80 hover:text-[#172033] dark:hover:text-white'
                                    }`}
                                  >
                                    <div className="truncate mr-2">
                                      <p className="truncate text-[11px] font-semibold">{acc.name}</p>
                                      <p className="text-[9px] text-[#64748B]">
                                        {acc.broker} • ${Number(acc.current_balance || 0).toLocaleString()}
                                      </p>
                                    </div>
                                    {isAccActive && (
                                      <Check className="h-3.5 w-3.5 text-[#3157D5] shrink-0 font-bold" />
                                    )}
                                  </button>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add New Account Quick Action */}
                  <div className="mt-2 pt-2 border-t border-[#E7EBF2] dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false)
                        setIsAccountModalOpen(true)
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#3157D5]/40 dark:border-blue-800/60 bg-[#EEF2FD]/50 dark:bg-blue-950/30 py-2 text-xs font-semibold text-[#3157D5] dark:text-blue-300 hover:bg-[#EEF2FD] dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Connect New Trading Account</span>
                    </button>
                  </div>
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
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#3157D5] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#2745AE] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-200" />
            <span>Log Trade</span>
          </button>

          {/* Notification Bell Pill */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#0D1424] border border-[#E7EBF2] dark:border-slate-800 shadow-2xs text-[#64748B] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F8FC] dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4 stroke-[2]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E05260] text-[9px] font-bold text-white shadow-xs">
              3
            </span>
          </button>

          {/* Date Selector Pill */}
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#0D1424] border border-[#E7EBF2] dark:border-slate-800 text-[#172033] dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-2xs hover:bg-[#F6F8FC] transition-colors cursor-pointer">
            <Calendar className="h-3.5 w-3.5 text-[#3157D5] stroke-[2.2]" />
            <span>{formattedDate}</span>
            <ChevronDown className="h-3 w-3 text-[#64748B] stroke-[2.5]" />
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

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  )
}
