'use client'

import React, { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import {
  Menu,
  Briefcase,
  Bell,
  Search,
  MessageSquare,
  ChevronDown,
  Check,
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
  const pathname = usePathname()
  const { accounts, activeAccountId, setActiveAccountId, activeAccount, isDemoMode } = useTrading()
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Compute page title based on current route
  const pageTitle = useMemo(() => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.startsWith('/journal')) return 'Trade Journal'
    if (pathname.startsWith('/analytics')) return 'Analytics'
    if (pathname.startsWith('/accounts')) return 'Accounts'
    if (pathname.startsWith('/calendar')) return 'Trading Calendar'
    if (pathname.startsWith('/reports')) return 'Reports'
    if (pathname.startsWith('/import')) return 'Import Center'
    if (pathname.startsWith('/prop-firms')) return 'Prop Challenges'
    if (pathname.startsWith('/psychology')) return 'Psychology & Discipline'
    if (pathname.startsWith('/strategies')) return 'Strategies'
    if (pathname.startsWith('/goals')) return 'Goals'
    if (pathname.startsWith('/plans')) return 'Future Plans'
    if (pathname.startsWith('/settings')) return 'Settings'
    if (pathname.startsWith('/ai-coach')) return 'AI Mentor'
    return 'Dashboard'
  }, [pathname])

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
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-[#0c141c]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 select-none">
        {/* Left Section: Page Title + Account Selector Pill */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-800 shadow-xs cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            {pageTitle}
          </h2>

          {/* Account Selector Pill with Categories */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {React.createElement(currentCategoryIcon, {
                className: 'h-3.5 w-3.5 text-blue-600 dark:text-cyan-400 stroke-[2.2] shrink-0',
              })}
              <span className="max-w-[120px] lg:max-w-[180px] truncate">
                {currentScopeTitle}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 stroke-[2.5]" />
            </button>

            {isAccountDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsAccountDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-80 max-h-[82vh] overflow-y-auto rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xl z-40 animate-in fade-in zoom-in-95 scrollbar-thin">
                  {/* Category Header */}
                  <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Trading Categories & Accounts
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
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
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        activeAccountId === 'ALL'
                          ? 'bg-[#1e3a8a] text-white shadow-xs'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-xl ${activeAccountId === 'ALL' ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600'}`}>
                          <Briefcase className="h-3.5 w-3.5 stroke-[2.2]" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">All Accounts</p>
                          <p className={`text-[10px] ${activeAccountId === 'ALL' ? 'text-blue-100' : 'text-slate-400'}`}>
                            Unified multi-broker portfolio ({accounts.length})
                          </p>
                        </div>
                      </div>
                      {activeAccountId === 'ALL' && <Check className="h-4 w-4 shrink-0 font-bold" />}
                    </button>
                  </div>

                  {/* 2 to 5 Concrete Categories in Requested Order */}
                  <div className="space-y-3">
                    {ACCOUNT_CATEGORIES.filter((c) => c.id !== 'ALL').map((category) => {
                      const catAccounts = accountsByCategory[category.id as 'DEMO' | 'BACKTEST' | 'PROP' | 'LIVE']
                      const isCatActive = activeAccountId === `CAT:${category.id}`
                      const IconComp = getCategoryIcon(category.id)

                      return (
                        <div
                          key={category.id}
                          className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-2 bg-slate-50/50 dark:bg-slate-900/50"
                        >
                          <button
                            onClick={() => {
                              setActiveAccountId(`CAT:${category.id}`)
                              setIsAccountDropdownOpen(false)
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              isCatActive
                                ? 'bg-slate-800 text-white dark:bg-slate-700'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${category.dotClass}`} />
                              <IconComp className="h-3.5 w-3.5" />
                              <span className="font-bold">{category.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {catAccounts.length}
                              </span>
                              {isCatActive && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 font-bold" />}
                            </div>
                          </button>

                          <div className="mt-1 space-y-1 pl-2">
                            {catAccounts.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic py-1 pl-2">
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
                                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                                      isAccActive
                                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-cyan-200 font-semibold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    <div className="truncate mr-2">
                                      <p className="truncate text-[11px] font-semibold">{acc.name}</p>
                                      <p className="text-[9px] text-slate-400">
                                        {acc.broker} • ${Number(acc.current_balance || 0).toLocaleString()}
                                      </p>
                                    </div>
                                    {isAccActive && (
                                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 font-bold" />
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
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false)
                        setIsAccountModalOpen(true)
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-400 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/30 py-2 text-xs font-semibold text-blue-700 dark:text-cyan-300 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
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

        {/* Right Section: Search Pill + Message Icon + Bell + User Avatar (Exact Reference UI) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Bar matching screenshot: "Search project, analytics..." */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project, analytics"
              className="rounded-full border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 w-44 lg:w-60 shadow-2xs transition-all"
            />
          </div>

          {/* Chat Bubble Icon */}
          <button
            onClick={() => window.location.href = '/ai-coach'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="AI Coach Messages"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* Notification Bell with Dot */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* User Avatar with Green Active Dot */}
          <div className="relative flex items-center cursor-pointer group">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs">
              {/* Fallback stylized avatar */}
              <div className="h-full w-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-bold text-xs">
                KS
              </div>
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>

          {/* Options Menu icon */}
          <button
            onClick={onOpenMobileMenu}
            className="hidden sm:flex md:hidden h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

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
