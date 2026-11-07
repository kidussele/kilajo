import { TradingAccount } from '@/types/trading'

export type AccountCategory = 'ALL' | 'DEMO' | 'BACKTEST' | 'PROP' | 'LIVE'

export interface CategoryDefinition {
  id: AccountCategory
  label: string
  shortLabel: string
  description: string
  color: 'emerald' | 'blue' | 'purple' | 'amber'
  badgeClass: string
  activeBgClass: string
  borderClass: string
  dotClass: string
}

/**
 * 5 Explicit Categories ordered exactly per user requirement:
 * 1. All Accounts
 * 2. Demo Practice
 * 3. Backtesting
 * 4. Prop Challenges
 * 5. Live Trading
 */
export const ACCOUNT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'ALL',
    label: 'All Accounts',
    shortLabel: 'All',
    description: 'Unified portfolio overview across all environments',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    activeBgClass: 'bg-emerald-600 text-white shadow-emerald-900/20',
    borderClass: 'border-emerald-500',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'DEMO',
    label: 'Demo Practice',
    shortLabel: 'Demo',
    description: 'Paper trading & simulated practice accounts',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    activeBgClass: 'bg-blue-600 text-white shadow-blue-900/20',
    borderClass: 'border-blue-500',
    dotClass: 'bg-blue-500',
  },
  {
    id: 'BACKTEST',
    label: 'Backtesting',
    shortLabel: 'Backtest',
    description: 'Historical strategy models & simulation test runs',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    activeBgClass: 'bg-purple-600 text-white shadow-purple-900/20',
    borderClass: 'border-purple-500',
    dotClass: 'bg-purple-500',
  },
  {
    id: 'PROP',
    label: 'Prop Challenges',
    shortLabel: 'Prop Firm',
    description: 'Prop firm evaluation & funded phase accounts',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    activeBgClass: 'bg-amber-600 text-white shadow-amber-900/20',
    borderClass: 'border-amber-500',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'LIVE',
    label: 'Live Trading',
    shortLabel: 'Live',
    description: 'Real money funded broker accounts',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    activeBgClass: 'bg-[#064e3b] text-white shadow-emerald-950/30',
    borderClass: 'border-emerald-600',
    dotClass: 'bg-emerald-600',
  },
]

/**
 * Categorizes an account deterministically into one of the 4 concrete categories:
 * DEMO | BACKTEST | PROP | LIVE
 */
export function getAccountCategory(acc: {
  account_type?: string | null
  is_prop_firm?: boolean | null
  name?: string | null
  broker?: string | null
}): 'DEMO' | 'BACKTEST' | 'PROP' | 'LIVE' {
  const type = (acc.account_type || '').toLowerCase()
  const name = (acc.name || '').toLowerCase()
  const broker = (acc.broker || '').toLowerCase()

  // 1. Backtesting
  if (type.includes('backtest') || name.includes('backtest') || broker.includes('backtest')) {
    return 'BACKTEST'
  }

  // 2. Prop Challenges
  if (
    acc.is_prop_firm ||
    type.includes('prop') ||
    type.includes('challenge') ||
    type.includes('evaluation') ||
    type.includes('funded') ||
    name.includes('challenge') ||
    name.includes('ftmo') ||
    name.includes('funded') ||
    broker.includes('ftmo') ||
    broker.includes('fundednext') ||
    broker.includes('mffx')
  ) {
    return 'PROP'
  }

  // 3. Demo Practice
  if (
    type.includes('demo') ||
    type.includes('practice') ||
    type.includes('paper') ||
    type.includes('sim') ||
    name.includes('demo') ||
    name.includes('practice') ||
    name.includes('paper')
  ) {
    return 'DEMO'
  }

  // 4. Default: Live Trading
  return 'LIVE'
}

/**
 * Returns human-friendly display label for current active scope
 */
export function getScopeLabel(activeAccountId: string, accounts: TradingAccount[]): string {
  if (activeAccountId === 'ALL') return 'All Accounts'
  if (activeAccountId === 'CAT:DEMO') return 'Demo Practice'
  if (activeAccountId === 'CAT:BACKTEST') return 'Backtesting'
  if (activeAccountId === 'CAT:PROP') return 'Prop Challenges'
  if (activeAccountId === 'CAT:LIVE') return 'Live Trading'
  const match = accounts.find((a) => a.id === activeAccountId)
  return match?.name || 'All Accounts'
}

