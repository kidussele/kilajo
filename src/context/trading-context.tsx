'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { Trade, TradingAccount, MetricSummary, TradeFilter, PropFirmRule, Strategy, PsychologyLog, Goal } from '@/types/trading'
import { calculateMetricSummary } from '@/lib/calculations/financial'
import { SAMPLE_ACCOUNTS, SAMPLE_TRADES, SAMPLE_PROP_RULES, SAMPLE_STRATEGIES, SAMPLE_PSYCHOLOGY, SAMPLE_GOALS } from '@/lib/data/sample-data'

interface TradingContextType {
  // Mode
  isDemoMode: boolean
  toggleDemoMode: (enabled: boolean) => void

  // Accounts
  accounts: TradingAccount[]
  activeAccountId: string | 'ALL'
  setActiveAccountId: (id: string | 'ALL') => void
  activeAccount: TradingAccount | null
  createAccount: (account: Omit<TradingAccount, 'id' | 'created_at' | 'updated_at'>) => void
  updateAccount: (id: string, updates: Partial<TradingAccount>) => void
  deleteAccount: (id: string) => void

  // Trades
  trades: Trade[]
  filteredTrades: Trade[]
  filter: TradeFilter
  setFilter: React.Dispatch<React.SetStateAction<TradeFilter>>
  addTrade: (trade: Omit<Trade, 'id' | 'created_at' | 'updated_at'>) => void
  updateTrade: (id: string, updates: Partial<Trade>) => void
  deleteTrade: (id: string) => void
  bulkAddTrades: (trades: Omit<Trade, 'id' | 'created_at' | 'updated_at'>[]) => { added: number; duplicates: number }

  // Prop Firm & Rules
  propRules: PropFirmRule[]
  updatePropRule: (accountId: string, updates: Partial<PropFirmRule>) => void

  // Strategies & Psychology & Goals
  strategies: Strategy[]
  addStrategy: (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>) => void
  psychologyLogs: PsychologyLog[]
  addPsychologyLog: (log: Omit<PsychologyLog, 'id' | 'created_at' | 'updated_at'>) => void
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void

  // Computed Metrics
  metrics: MetricSummary
  isLoading: boolean
  resetAllData: () => void
}

const TradingContext = createContext<TradingContextType | undefined>(undefined)

const STORAGE_KEY_TRADES = 'kilajo_trades_v1'
const STORAGE_KEY_ACCOUNTS = 'kilajo_accounts_v1'
const STORAGE_KEY_DEMO = 'kilajo_is_demo_v1'
const STORAGE_KEY_STRATEGIES = 'kilajo_strategies_v1'
const STORAGE_KEY_PROP = 'kilajo_prop_rules_v1'
const STORAGE_KEY_PSYCH = 'kilajo_psych_v1'
const STORAGE_KEY_GOALS = 'kilajo_goals_v1'

export function TradingProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
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

  // Initialize from LocalStorage or empty state
  useEffect(() => {
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
      } else {
        const storedAccounts = localStorage.getItem(STORAGE_KEY_ACCOUNTS)
        const storedTrades = localStorage.getItem(STORAGE_KEY_TRADES)
        const storedStrategies = localStorage.getItem(STORAGE_KEY_STRATEGIES)
        const storedProp = localStorage.getItem(STORAGE_KEY_PROP)
        const storedPsych = localStorage.getItem(STORAGE_KEY_PSYCH)
        const storedGoals = localStorage.getItem(STORAGE_KEY_GOALS)

        if (storedAccounts) setAccounts(JSON.parse(storedAccounts))
        if (storedTrades) setTrades(JSON.parse(storedTrades))
        if (storedStrategies) setStrategies(JSON.parse(storedStrategies))
        if (storedProp) setPropRules(JSON.parse(storedProp))
        if (storedPsych) setPsychologyLogs(JSON.parse(storedPsych))
        if (storedGoals) setGoals(JSON.parse(storedGoals))
      }
    } catch (e) {
      console.error('Failed to parse local trading storage:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sync state to local storage when not in demo mode
  const persistState = (newAccounts: TradingAccount[], newTrades: Trade[]) => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(newAccounts))
      localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(newTrades))
    }
  }

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
      const storedAccounts = localStorage.getItem(STORAGE_KEY_ACCOUNTS)
      const storedTrades = localStorage.getItem(STORAGE_KEY_TRADES)
      setAccounts(storedAccounts ? JSON.parse(storedAccounts) : [])
      setTrades(storedTrades ? JSON.parse(storedTrades) : [])
      setPropRules([])
      setStrategies([])
      setPsychologyLogs([])
      setGoals([])
    }
    setActiveAccountId('ALL')
  }

  // Account operations
  const activeAccount = useMemo(() => {
    if (activeAccountId === 'ALL') return null
    return accounts.find((a) => a.id === activeAccountId) || null
  }, [accounts, activeAccountId])

  const createAccount = (accountData: Omit<TradingAccount, 'id' | 'created_at' | 'updated_at'>) => {
    const newAcc: TradingAccount = {
      ...accountData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [...accounts, newAcc]
    setAccounts(updated)
    persistState(updated, trades)
    setActiveAccountId(newAcc.id)
  }

  const updateAccount = (id: string, updates: Partial<TradingAccount>) => {
    const updated = accounts.map((acc) => (acc.id === id ? { ...acc, ...updates, updated_at: new Date().toISOString() } : acc))
    setAccounts(updated)
    persistState(updated, trades)
  }

  const deleteAccount = (id: string) => {
    const updatedAccs = accounts.filter((a) => a.id !== id)
    const updatedTrades = trades.filter((t) => t.account_id !== id)
    setAccounts(updatedAccs)
    setTrades(updatedTrades)
    persistState(updatedAccs, updatedTrades)
    if (activeAccountId === id) {
      setActiveAccountId('ALL')
    }
  }

  // Trade operations
  const addTrade = (tradeData: Omit<Trade, 'id' | 'created_at' | 'updated_at'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updatedTrades = [newTrade, ...trades]
    setTrades(updatedTrades)

    // Recalculate account balance
    const acc = accounts.find((a) => a.id === tradeData.account_id)
    if (acc) {
      const updatedBalance = Number(acc.current_balance) + Number(tradeData.net_pnl || 0)
      updateAccount(acc.id, { current_balance: updatedBalance })
    }

    persistState(accounts, updatedTrades)
  }

  const updateTrade = (id: string, updates: Partial<Trade>) => {
    const updatedTrades = trades.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    setTrades(updatedTrades)
    persistState(accounts, updatedTrades)
  }

  const deleteTrade = (id: string) => {
    const updatedTrades = trades.filter((t) => t.id !== id)
    setTrades(updatedTrades)
    persistState(accounts, updatedTrades)
  }

  const bulkAddTrades = (incomingTrades: Omit<Trade, 'id' | 'created_at' | 'updated_at'>[]) => {
    let duplicateCount = 0
    const addedTrades: Trade[] = []

    // Build existing ticket map for deduplication
    const existingTicketSet = new Set(
      trades
        .filter((t) => t.source_ticket && t.account_id === incomingTrades[0]?.account_id)
        .map((t) => `${t.account_id}_${t.source_ticket}`)
    )

    incomingTrades.forEach((t) => {
      const ticketKey = t.source_ticket ? `${t.account_id}_${t.source_ticket}` : null
      if (ticketKey && existingTicketSet.has(ticketKey)) {
        duplicateCount++
        return
      }

      if (ticketKey) {
        existingTicketSet.add(ticketKey)
      }

      addedTrades.push({
        ...t,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    })

    const finalTrades = [...addedTrades, ...trades]
    setTrades(finalTrades)

    // Update account balances
    const targetAccountId = incomingTrades[0]?.account_id
    if (targetAccountId) {
      const totalNet = addedTrades.reduce((acc, t) => acc + Number(t.net_pnl || 0), 0)
      const targetAcc = accounts.find((a) => a.id === targetAccountId)
      if (targetAcc) {
        updateAccount(targetAccountId, { current_balance: Number(targetAcc.current_balance) + totalNet })
      }
    }

    persistState(accounts, finalTrades)
    return { added: addedTrades.length, duplicates: duplicateCount }
  }

  // Prop rules, strategies, goals
  const updatePropRule = (accountId: string, updates: Partial<PropFirmRule>) => {
    const updated = propRules.map((r) => (r.account_id === accountId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r))
    setPropRules(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_PROP, JSON.stringify(updated))
  }

  const addStrategy = (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>) => {
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

  const addPsychologyLog = (log: Omit<PsychologyLog, 'id' | 'created_at' | 'updated_at'>) => {
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

  const addGoal = (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
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

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g))
    setGoals(updated)
    if (!isDemoMode) localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updated))
  }

  const resetAllData = () => {
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

  // Filtered trades computation
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // Account filter
      if (activeAccountId !== 'ALL' && trade.account_id !== activeAccountId) {
        return false
      }
      if (filter.accountId && filter.accountId !== 'ALL' && trade.account_id !== filter.accountId) {
        return false
      }
      // Symbol filter
      if (filter.symbol && !trade.symbol.toLowerCase().includes(filter.symbol.toLowerCase())) {
        return false
      }
      // Direction filter
      if (filter.direction && trade.direction !== filter.direction) {
        return false
      }
      // Status filter
      if (filter.status && trade.status !== filter.status) {
        return false
      }
      // Strategy filter
      if (filter.strategyId && trade.strategy_id !== filter.strategyId) {
        return false
      }
      // Session filter
      if (filter.session && trade.session !== filter.session) {
        return false
      }
      // Date range filter
      if (filter.startDate) {
        const entryTime = new Date(trade.entry_time).getTime()
        const start = new Date(filter.startDate).getTime()
        if (entryTime < start) return false
      }
      if (filter.endDate) {
        const exitTime = new Date(trade.exit_time || trade.entry_time).getTime()
        const end = new Date(filter.endDate).getTime() + 86400000 // inclusive end of day
        if (exitTime > end) return false
      }
      return true
    })
  }, [trades, activeAccountId, filter])

  // Real-time metric summary calculated from filtered trades
  const metrics = useMemo(() => {
    const initialBal = activeAccount ? Number(activeAccount.initial_balance) : 10000
    return calculateMetricSummary(filteredTrades, initialBal)
  }, [filteredTrades, activeAccount])

  return (
    <TradingContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
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

