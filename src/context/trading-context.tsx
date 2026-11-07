'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import {
  Trade,
  TradingAccount,
  MetricSummary,
  TradeFilter,
  PropFirmRule,
  Strategy,
  PsychologyLog,
  Goal,
} from '@/types/trading'
import { calculateMetricSummary } from '@/lib/calculations/financial'
import { aggregatePortfolioBalances, PortfolioBalanceSummary } from '@/lib/calculations/currency'
import { getAccountCategory } from '@/lib/accounts/categories'
import {
  SAMPLE_ACCOUNTS,
  SAMPLE_TRADES,
  SAMPLE_PROP_RULES,
  SAMPLE_STRATEGIES,
  SAMPLE_PSYCHOLOGY,
  SAMPLE_GOALS,
} from '@/lib/data/sample-data'
import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import {
  fetchUserAccounts,
  createAccountDB,
  updateAccountDB,
  deleteAccountDB,
  reconcileAccountBalance,
} from '@/lib/dal/accounts'
import {
  fetchUserTrades,
  addTradeDB,
  updateTradeDB,
  deleteTradeDB,
  bulkAddTradesDB,
} from '@/lib/dal/trades'
import {
  fetchUserStrategies,
  addStrategyDB,
  fetchUserPropRules,
  updatePropRuleDB,
  fetchUserPsychologyLogs,
  addPsychologyLogDB,
  fetchUserGoals,
  addGoalDB,
  updateGoalDB,
} from '@/lib/dal/modules'
import { getCurrentProfile, Profile, signOutUser } from '@/lib/dal/auth'

interface TradingContextType {
  // Mode & Auth
  isDemoMode: boolean
  toggleDemoMode: (enabled: boolean) => void
  userProfile: Profile | null
  signOut: () => Promise<void>
  refreshData: () => Promise<void>

  // Accounts
  accounts: TradingAccount[]
  activeAccountId: string | 'ALL'
  setActiveAccountId: (id: string | 'ALL') => void
  activeAccount: TradingAccount | null
  createAccount: (account: Omit<TradingAccount, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAccount: (id: string, updates: Partial<TradingAccount>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>

  // Trades
  trades: Trade[]
  filteredTrades: Trade[]
  filter: TradeFilter
  setFilter: React.Dispatch<React.SetStateAction<TradeFilter>>
  addTrade: (trade: Omit<Trade, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>
  deleteTrade: (id: string) => Promise<void>
  bulkAddTrades: (trades: Omit<Trade, 'id' | 'created_at' | 'updated_at'>[]) => Promise<{ added: number; duplicates: number }>

  // Prop Firm & Rules
  propRules: PropFirmRule[]
  updatePropRule: (accountId: string, updates: Partial<PropFirmRule>) => Promise<void>

  // Strategies & Psychology & Goals
  strategies: Strategy[]
  addStrategy: (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  psychologyLogs: PsychologyLog[]
  addPsychologyLog: (log: Omit<PsychologyLog, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>

  // Computed Portfolio & Financial Metrics
  metrics: MetricSummary
  portfolioBalance: PortfolioBalanceSummary
  isLoading: boolean
  resetAllData: () => Promise<void>
}

const TradingContext = createContext<TradingContextType | undefined>(undefined)

const STORAGE_KEY_DEMO = 'kilajo_is_demo_v1'
const STORAGE_KEY_TRADES = 'kilajo_trades_offline_v1'
const STORAGE_KEY_ACCOUNTS = 'kilajo_accounts_offline_v1'
const STORAGE_KEY_STRATEGIES = 'kilajo_strategies_offline_v1'
const STORAGE_KEY_PROP = 'kilajo_prop_rules_offline_v1'
const STORAGE_KEY_PSYCH = 'kilajo_psych_offline_v1'
const STORAGE_KEY_GOALS = 'kilajo_goals_offline_v1'

export function TradingProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)

  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | 'ALL'>('ALL')
  const [trades, setTrades] = useState<Trade[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [propRules, setPropRules] = useState<PropFirmRule[]>([])
  const [psychologyLogs, setPsychologyLogs] = useState<PsychologyLog[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  const [filter, setFilter] = useState<TradeFilter>({
    page: 1,
    pageSize: 15,
    sortOrder: 'desc',
    sortBy: 'exit_time',
  })

  // Detect Supabase Live configuration
  const isSupabaseLive = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')
    )
  }, [])

  // Master Data Refresh Method
  const refreshData = async () => {
    setIsLoading(true)
    try {
      const storedDemo = localStorage.getItem(STORAGE_KEY_DEMO)
      const isDemo = storedDemo ? JSON.parse(storedDemo) : false
      setIsDemoMode(isDemo)

      if (isDemo) {
        setAccounts(SAMPLE_ACCOUNTS)
        setTrades(SAMPLE_TRADES)
        setPropRules(SAMPLE_PROP_RULES)
        setStrategies(SAMPLE_STRATEGIES)
        setPsychologyLogs(SAMPLE_PSYCHOLOGY)
        setGoals(SAMPLE_GOALS)
        return
      }

      // Check if user is authenticated via Supabase
      if (isSupabaseLive) {
        const supabase = createBrowserSupabase()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const [profile, accs, trds, strats, rules, psych, gls] = await Promise.all([
            getCurrentProfile(),
            fetchUserAccounts(),
            fetchUserTrades(),
            fetchUserStrategies(),
            fetchUserPropRules(),
            fetchUserPsychologyLogs(),
            fetchUserGoals(),
          ])

          setUserProfile(profile)
          setAccounts(accs)
          setTrades(trds)
          setStrategies(strats)
          setPropRules(rules)
          setPsychologyLogs(psych)
          setGoals(gls)
          return
        }
      }

      // Offline / Local fallback if not authenticated
      const storedAccounts = localStorage.getItem(STORAGE_KEY_ACCOUNTS)
      const storedTrades = localStorage.getItem(STORAGE_KEY_TRADES)
      const storedStrategies = localStorage.getItem(STORAGE_KEY_STRATEGIES)
      const storedProp = localStorage.getItem(STORAGE_KEY_PROP)
      const storedPsych = localStorage.getItem(STORAGE_KEY_PSYCH)
      const storedGoals = localStorage.getItem(STORAGE_KEY_GOALS)

      setAccounts(storedAccounts ? JSON.parse(storedAccounts) : [])
      setTrades(storedTrades ? JSON.parse(storedTrades) : [])
      setStrategies(storedStrategies ? JSON.parse(storedStrategies) : [])
      setPropRules(storedProp ? JSON.parse(storedProp) : [])
      setPsychologyLogs(storedPsych ? JSON.parse(storedPsych) : [])
      setGoals(storedGoals ? JSON.parse(storedGoals) : [])
    } catch (e) {
      console.error('Error refreshing trading data:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [isSupabaseLive])

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled)
    localStorage.setItem(STORAGE_KEY_DEMO, JSON.stringify(enabled))
    if (enabled) {
      setAccounts(SAMPLE_ACCOUNTS)
      setTrades(SAMPLE_TRADES)
      setPropRules(SAMPLE_PROP_RULES)
      setStrategies(SAMPLE_STRATEGIES)
      setPsychologyLogs(SAMPLE_PSYCHOLOGY)
      setGoals(SAMPLE_GOALS)
    } else {
      refreshData()
    }
    setActiveAccountId('ALL')
  }

  const signOut = async () => {
    await signOutUser()
    setUserProfile(null)
    refreshData()
  }

  // Active Account Helper
  const activeAccount = useMemo(() => {
    if (activeAccountId === 'ALL' || activeAccountId.startsWith('CAT:')) return null
    return accounts.find((a) => a.id === activeAccountId) || null
  }, [accounts, activeAccountId])

  // --- RECONCILE BALANCE MATHEMATICALLY ---
  const calculateAccountBalance = (acc: TradingAccount, allTrades: Trade[]): number => {
    const accClosedTrades = allTrades.filter(
      (t) => t.account_id === acc.id && t.status === 'CLOSED'
    )
    const netSum = accClosedTrades.reduce((sum, t) => sum + Number(t.net_pnl || 0), 0)
    return Number((Number(acc.initial_balance) + netSum).toFixed(4))
  }

  // --- ACCOUNTS OPERATIONS ---
  const createAccount = async (accountData: Omit<TradingAccount, 'id' | 'created_at' | 'updated_at'>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const created = await createAccountDB(accountData)
      if (created) {
        setAccounts((prev) => [created, ...prev])
        setActiveAccountId(created.id)
      }
      return
    }

    const newAcc: TradingAccount = {
      ...accountData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [...accounts, newAcc]
    setAccounts(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated))
    setActiveAccountId(newAcc.id)
  }

  const updateAccount = async (id: string, updates: Partial<TradingAccount>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const updated = await updateAccountDB(id, updates)
      if (updated) {
        setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)))
      }
      return
    }

    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, ...updates, updated_at: new Date().toISOString() } : acc
    )
    setAccounts(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updated))
  }

  const deleteAccount = async (id: string) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      await deleteAccountDB(id)
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      setTrades((prev) => prev.filter((t) => t.account_id !== id))
      if (activeAccountId === id) setActiveAccountId('ALL')
      return
    }

    const updatedAccs = accounts.filter((a) => a.id !== id)
    const updatedTrades = trades.filter((t) => t.account_id !== id)
    setAccounts(updatedAccs)
    setTrades(updatedTrades)
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccs))
      localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(updatedTrades))
    }
    if (activeAccountId === id) setActiveAccountId('ALL')
  }

  // --- TRADES OPERATIONS WITH GUARANTEED BALANCE RECONCILIATION ---
  const addTrade = async (tradeData: Omit<Trade, 'id' | 'created_at' | 'updated_at'>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const created = await addTradeDB(tradeData)
      if (created) {
        const nextTrades = [created, ...trades]
        setTrades(nextTrades)
        // Refresh account balance
        const updatedAccounts = await fetchUserAccounts()
        setAccounts(updatedAccounts)
      }
      return
    }

    const newTrade: Trade = {
      ...tradeData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updatedTrades = [newTrade, ...trades]
    setTrades(updatedTrades)

    // Reconcile balance in memory
    const updatedAccs = accounts.map((acc) => {
      if (acc.id === tradeData.account_id) {
        return { ...acc, current_balance: calculateAccountBalance(acc, updatedTrades) }
      }
      return acc
    })
    setAccounts(updatedAccs)

    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(updatedTrades))
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccs))
    }
  }

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const updated = await updateTradeDB(id, updates)
      if (updated) {
        const nextTrades = trades.map((t) => (t.id === id ? updated : t))
        setTrades(nextTrades)
        const updatedAccounts = await fetchUserAccounts()
        setAccounts(updatedAccounts)
      }
      return
    }

    const updatedTrades = trades.map((t) =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    )
    setTrades(updatedTrades)

    // Reconcile all affected account balances
    const targetAccountId = updates.account_id || trades.find((t) => t.id === id)?.account_id
    const updatedAccs = accounts.map((acc) => {
      if (acc.id === targetAccountId) {
        return { ...acc, current_balance: calculateAccountBalance(acc, updatedTrades) }
      }
      return acc
    })
    setAccounts(updatedAccs)

    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(updatedTrades))
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccs))
    }
  }

  const deleteTrade = async (id: string) => {
    const tradeToDelete = trades.find((t) => t.id === id)
    const targetAccountId = tradeToDelete?.account_id

    if (userProfile && isSupabaseLive && !isDemoMode) {
      await deleteTradeDB(id)
      setTrades((prev) => prev.filter((t) => t.id !== id))
      const updatedAccounts = await fetchUserAccounts()
      setAccounts(updatedAccounts)
      return
    }

    const updatedTrades = trades.filter((t) => t.id !== id)
    setTrades(updatedTrades)

    // Reconcile account balance after deletion
    const updatedAccs = accounts.map((acc) => {
      if (acc.id === targetAccountId) {
        return { ...acc, current_balance: calculateAccountBalance(acc, updatedTrades) }
      }
      return acc
    })
    setAccounts(updatedAccs)

    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(updatedTrades))
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccs))
    }
  }

  const bulkAddTrades = async (incomingTrades: Omit<Trade, 'id' | 'created_at' | 'updated_at'>[]) => {
    if (incomingTrades.length === 0) return { added: 0, duplicates: 0 }
    const targetAccountId = incomingTrades[0].account_id

    if (userProfile && isSupabaseLive && !isDemoMode) {
      const summary = await bulkAddTradesDB(incomingTrades)
      const [freshTrades, freshAccounts] = await Promise.all([
        fetchUserTrades(),
        fetchUserAccounts(),
      ])
      setTrades(freshTrades)
      setAccounts(freshAccounts)
      return summary
    }

    let duplicateCount = 0
    const addedTrades: Trade[] = []
    const existingTicketSet = new Set(
      trades
        .filter((t) => t.source_ticket && t.account_id === targetAccountId)
        .map((t) => `${t.account_id}_${t.source_ticket}`)
    )

    incomingTrades.forEach((t) => {
      const ticketKey = t.source_ticket ? `${t.account_id}_${t.source_ticket}` : null
      if (ticketKey && existingTicketSet.has(ticketKey)) {
        duplicateCount++
        return
      }

      if (ticketKey) existingTicketSet.add(ticketKey)

      addedTrades.push({
        ...t,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    })

    const finalTrades = [...addedTrades, ...trades]
    setTrades(finalTrades)

    // Reconcile balance for target account
    const updatedAccs = accounts.map((acc) => {
      if (acc.id === targetAccountId) {
        return { ...acc, current_balance: calculateAccountBalance(acc, finalTrades) }
      }
      return acc
    })
    setAccounts(updatedAccs)

    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(finalTrades))
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(updatedAccs))
    }

    return { added: addedTrades.length, duplicates: duplicateCount }
  }

  // --- MODULE OPERATIONS (Strategies, Prop Rules, Psychology, Goals) ---
  const updatePropRule = async (accountId: string, updates: Partial<PropFirmRule>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      await updatePropRuleDB(accountId, updates)
      const freshRules = await fetchUserPropRules()
      setPropRules(freshRules)
      return
    }

    const updated = propRules.map((r) =>
      r.account_id === accountId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
    )
    setPropRules(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_PROP, JSON.stringify(updated))
  }

  const addStrategy = async (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const created = await addStrategyDB(strategy)
      if (created) setStrategies((prev) => [...prev, created])
      return
    }

    const newStrat: Strategy = {
      ...strategy,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [...strategies, newStrat]
    setStrategies(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_STRATEGIES, JSON.stringify(updated))
  }

  const addPsychologyLog = async (log: Omit<PsychologyLog, 'id' | 'created_at' | 'updated_at'>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const created = await addPsychologyLogDB(log)
      if (created) {
        setPsychologyLogs((prev) => [created, ...prev.filter((p) => p.date !== log.date)])
      }
      return
    }

    const newLog: PsychologyLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newLog, ...psychologyLogs.filter((l) => l.date !== log.date)]
    setPsychologyLogs(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_PSYCH, JSON.stringify(updated))
  }

  const addGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const created = await addGoalDB(goal)
      if (created) setGoals((prev) => [...prev, created])
      return
    }

    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [...goals, newGoal]
    setGoals(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updated))
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (userProfile && isSupabaseLive && !isDemoMode) {
      const updated = await updateGoalDB(id, updates)
      if (updated) {
        setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
      }
      return
    }

    const updated = goals.map((g) =>
      g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
    )
    setGoals(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updated))
  }

  const resetAllData = async () => {
    setTrades([])
    setAccounts([])
    setPropRules([])
    setStrategies([])
    setPsychologyLogs([])
    setGoals([])
    setActiveAccountId('ALL')
    if (!isDemoMode) {
      localStorage.removeItem(STORAGE_KEY_TRADES)
      localStorage.removeItem(STORAGE_KEY_ACCOUNTS)
      localStorage.removeItem(STORAGE_KEY_PROP)
      localStorage.removeItem(STORAGE_KEY_STRATEGIES)
      localStorage.removeItem(STORAGE_KEY_PSYCH)
      localStorage.removeItem(STORAGE_KEY_GOALS)
    }
  }

  // --- FILTERED TRADES COMPUTATION ---
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (activeAccountId !== 'ALL') {
        if (activeAccountId.startsWith('CAT:')) {
          const category = activeAccountId.replace('CAT:', '')
          const account = accounts.find((a) => a.id === trade.account_id)
          if (!account || getAccountCategory(account) !== category) return false
        } else if (trade.account_id !== activeAccountId) {
          return false
        }
      }
      if (filter.accountId && filter.accountId !== 'ALL' && trade.account_id !== filter.accountId) return false
      if (filter.symbol && !trade.symbol.toLowerCase().includes(filter.symbol.toLowerCase())) return false
      if (filter.direction && trade.direction !== filter.direction) return false
      if (filter.status && trade.status !== filter.status) return false
      if (filter.strategyId && trade.strategy_id !== filter.strategyId) return false
      if (filter.session && trade.session !== filter.session) return false
      if (filter.startDate) {
        const entryTime = new Date(trade.entry_time).getTime()
        const start = new Date(filter.startDate).getTime()
        if (entryTime < start) return false
      }
      if (filter.endDate) {
        const exitTime = new Date(trade.exit_time || trade.entry_time).getTime()
        const end = new Date(filter.endDate).getTime() + 86400000
        if (exitTime > end) return false
      }
      return true
    })
  }, [trades, activeAccountId, accounts, filter])

  // --- METRIC CALCULATIONS ---
  const metrics = useMemo(() => {
    let initialBal = 10000
    if (activeAccount) {
      initialBal = Number(activeAccount.initial_balance)
    } else if (activeAccountId.startsWith('CAT:')) {
      const catAccounts = accounts.filter((a) => getAccountCategory(a) === activeAccountId.replace('CAT:', ''))
      const totalInitial = catAccounts.reduce((sum, a) => sum + Number(a.initial_balance || 0), 0)
      initialBal = totalInitial > 0 ? totalInitial : 10000
    } else if (accounts.length > 0) {
      const totalInitial = accounts.reduce((sum, a) => sum + Number(a.initial_balance || 0), 0)
      initialBal = totalInitial > 0 ? totalInitial : 10000
    }
    return calculateMetricSummary(filteredTrades, initialBal)
  }, [filteredTrades, activeAccount, activeAccountId, accounts])

  // --- MULTI-CURRENCY PORTFOLIO BALANCES ---
  const baseCurrency = userProfile?.base_currency || activeAccount?.currency || 'USD'
  const portfolioBalance = useMemo(() => {
    const targetAccounts = activeAccountId === 'ALL'
      ? accounts
      : activeAccountId.startsWith('CAT:')
      ? accounts.filter((a) => getAccountCategory(a) === activeAccountId.replace('CAT:', ''))
      : accounts.filter((a) => a.id === activeAccountId)
    return aggregatePortfolioBalances(targetAccounts, baseCurrency)
  }, [accounts, activeAccountId, baseCurrency])

  return (
    <TradingContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        userProfile,
        signOut,
        refreshData,
        accounts,
        activeAccountId,
        setActiveAccountId,
        activeAccount,
        createAccount,
        updateAccount,
        deleteAccount,
        trades,
        filteredTrades,
        filter,
        setFilter,
        addTrade,
        updateTrade,
        deleteTrade,
        bulkAddTrades,
        propRules,
        updatePropRule,
        strategies,
        addStrategy,
        psychologyLogs,
        addPsychologyLog,
        goals,
        addGoal,
        updateGoal,
        metrics,
        portfolioBalance,
        isLoading,
        resetAllData,
      }}
    >
      {children}
    </TradingContext.Provider>
  )
}

export function useTrading() {
  const context = useContext(TradingContext)
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider')
  }
  return context
}
