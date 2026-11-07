import { Database } from './database'

export type Trade = Database['public']['Tables']['trades']['Row']
export type TradeInsert = Database['public']['Tables']['trades']['Insert']
export type TradeUpdate = Database['public']['Tables']['trades']['Update']

export type TradingAccount = Database['public']['Tables']['trading_accounts']['Row']
export type TradingAccountInsert = Database['public']['Tables']['trading_accounts']['Insert']
export type TradingAccountUpdate = Database['public']['Tables']['trading_accounts']['Update']

export type PropFirmRule = Database['public']['Tables']['prop_firm_rules']['Row']
export type Strategy = Database['public']['Tables']['strategies']['Row']
export type PsychologyLog = Database['public']['Tables']['psychology_logs']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']

export interface TradeFilter {
  accountId?: string
  broker?: string
  propFirm?: string
  startDate?: string
  endDate?: string
  symbol?: string
  direction?: 'BUY' | 'SELL'
  status?: 'OPEN' | 'CLOSED'
  strategyId?: string
  session?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface MetricSummary {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakevenTrades: number
  winRate: number // Excluding breakeven
  lossRate: number
  netProfit: number
  grossProfit: number
  grossLoss: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  riskRewardRatio: number
  expectancy: number
  maxDrawdownAmount: number
  maxDrawdownPercentage: number
  currentDrawdown: number
  consecutiveWins: number
  consecutiveLosses: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  recoveryFactor: number
  sharpeRatio?: number
  totalCommissions: number
  totalSwap: number
}

export interface EquityPoint {
  date: string
  tradeNumber: number
  symbol: string
  balance: number
  equity: number
  drawdown: number
  drawdownPct: number
  netPnl: number
  cumulativePnl: number
}

export interface DailyPerformance {
  date: string
  netPnl: number
  tradesCount: number
  winCount: number
  lossCount: number
  winRate: number
}

export interface BreakdownStat {
  category: string
  tradesCount: number
  winRate: number
  netPnl: number
  profitFactor: number
  averagePnl: number
}

export interface PropFirmChallengeStatus {
  accountId: string
  firmName: string
  initialBalance: number
  currentBalance: number
  targetBalance: number
  profitTargetAmount: number
  currentProfitAmount: number
  profitProgressPct: number
  dailyLossLimitAmount: number
  todaysLossAmount: number
  remainingDailyLoss: number
  maxLossLimitAmount: number
  peakBalance: number
  currentDrawdownAmount: number
  remainingMaxDrawdown: number
  tradingDaysCompleted: number
  minTradingDaysRequired: number
  deadlineDate?: string | null
  status: 'ACTIVE' | 'PASSED' | 'FAILED' | 'DISQUALIFIED'
  breachReason?: string | null
}

