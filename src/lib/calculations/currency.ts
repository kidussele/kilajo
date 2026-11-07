import { TradingAccount } from '@/types/trading'

/**
 * Standard reference exchange rates against USD.
 * In production, these can be augmented with real-time rate feeds.
 */
export const DEFAULT_EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.085, // 1 EUR = 1.085 USD
  GBP: 1.295, // 1 GBP = 1.295 USD
  AUD: 0.655, // 1 AUD = 0.655 USD
  CAD: 0.722, // 1 CAD = 0.722 USD
  JPY: 0.00657, // 1 JPY = 0.00657 USD (approx 152 JPY per USD)
  CHF: 1.135, // 1 CHF = 1.135 USD
}

/**
 * Converts any financial amount from a source currency to a target currency.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number {
  if (isNaN(amount) || amount === 0) return 0
  const from = (fromCurrency || 'USD').toUpperCase()
  const to = (toCurrency || 'USD').toUpperCase()

  if (from === to) return amount

  const fromRateToUSD = DEFAULT_EXCHANGE_RATES_TO_USD[from] || 1.0
  const toRateToUSD = DEFAULT_EXCHANGE_RATES_TO_USD[to] || 1.0

  // Convert amount to USD first
  const amountInUSD = amount * fromRateToUSD

  // Convert USD to target currency
  const targetAmount = amountInUSD / toRateToUSD

  return Number(targetAmount.toFixed(4))
}

export interface PortfolioBalanceSummary {
  totalInBaseCurrency: number
  baseCurrency: string
  byCurrency: {
    currency: string
    nativeTotal: number
    convertedTotal: number
    accountCount: number
  }[]
}

/**
 * Aggregates multiple trading accounts safely without blindly summing different currencies.
 * Every balance is properly converted to the trader's selected base currency.
 */
export function aggregatePortfolioBalances(
  accounts: TradingAccount[],
  baseCurrency: string = 'USD'
): PortfolioBalanceSummary {
  if (!accounts || accounts.length === 0) {
    return {
      totalInBaseCurrency: 0,
      baseCurrency,
      byCurrency: [],
    }
  }

  const currencyMap = new Map<string, { nativeTotal: number; accountCount: number }>()

  accounts.forEach((acc) => {
    const cur = (acc.currency || 'USD').toUpperCase()
    const bal = Number(acc.current_balance) || 0
    const existing = currencyMap.get(cur) || { nativeTotal: 0, accountCount: 0 }
    existing.nativeTotal += bal
    existing.accountCount++
    currencyMap.set(cur, existing)
  })

  let totalInBaseCurrency = 0
  const byCurrency = Array.from(currencyMap.entries()).map(([curr, data]) => {
    const converted = convertCurrency(data.nativeTotal, curr, baseCurrency)
    totalInBaseCurrency += converted
    return {
      currency: curr,
      nativeTotal: Number(data.nativeTotal.toFixed(2)),
      convertedTotal: Number(converted.toFixed(2)),
      accountCount: data.accountCount,
    }
  })

  return {
    totalInBaseCurrency: Number(totalInBaseCurrency.toFixed(2)),
    baseCurrency,
    byCurrency,
  }
}
