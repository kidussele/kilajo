import { Trade, MetricSummary, EquityPoint, DailyPerformance, BreakdownStat } from '@/types/trading'

/**
 * Calculates complete trading performance analytics accurately according to institutional standards.
 */
export function calculateMetricSummary(trades: Trade[], initialBalance: number = 10000): MetricSummary {
  const closedTrades = trades
    .filter((t) => t.status === 'CLOSED' && t.exit_time)
    .sort((a, b) => new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime())

  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      lossRate: 0,
      netProfit: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      riskRewardRatio: 0,
      expectancy: 0,
      maxDrawdownAmount: 0,
      maxDrawdownPercentage: 0,
      currentDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      recoveryFactor: 0,
      totalCommissions: 0,
      totalSwap: 0,
    }
  }

  let grossProfit = 0
  let grossLoss = 0
  let totalCommissions = 0
  let totalSwap = 0
  let winningTrades = 0
  let losingTrades = 0
  let breakevenTrades = 0
  let winAmountsTotal = 0
  let lossAmountsTotal = 0

  let currentConsecWins = 0
  let currentConsecLosses = 0
  let maxConsecWins = 0
  let maxConsecLosses = 0

  let peakBalance = initialBalance
  let currentBalance = initialBalance
  let maxDrawdownAmount = 0
  let maxDrawdownPercentage = 0

  for (const trade of closedTrades) {
    const netPnl = Number(trade.net_pnl) || 0
    const commission = Number(trade.commission) || 0
    const swap = Number(trade.swap) || 0

    totalCommissions += commission
    totalSwap += swap

    if (netPnl > 0.0001) {
      winningTrades++
      winAmountsTotal += netPnl
      grossProfit += Number(trade.gross_pnl) > 0 ? Number(trade.gross_pnl) : netPnl
      currentConsecWins++
      currentConsecLosses = 0
      if (currentConsecWins > maxConsecWins) maxConsecWins = currentConsecWins
    } else if (netPnl < -0.0001) {
      losingTrades++
      lossAmountsTotal += Math.abs(netPnl)
      grossLoss += Number(trade.gross_pnl) < 0 ? Math.abs(Number(trade.gross_pnl)) : Math.abs(netPnl)
      currentConsecLosses++
      currentConsecWins = 0
      if (currentConsecLosses > maxConsecLosses) maxConsecLosses = currentConsecLosses
    } else {
      breakevenTrades++
    }

    currentBalance += netPnl
    if (currentBalance > peakBalance) {
      peakBalance = currentBalance
    }

    const drawdownAmt = peakBalance - currentBalance
    if (drawdownAmt > maxDrawdownAmount) {
      maxDrawdownAmount = drawdownAmt
    }

    const drawdownPct = peakBalance > 0 ? (drawdownAmt / peakBalance) * 100 : 0
    if (drawdownPct > maxDrawdownPercentage) {
      maxDrawdownPercentage = drawdownPct
    }
  }

  const netProfit = winAmountsTotal - lossAmountsTotal
  const decisiveTrades = winningTrades + losingTrades
  const winRate = decisiveTrades > 0 ? (winningTrades / decisiveTrades) * 100 : 0
  const lossRate = decisiveTrades > 0 ? (losingTrades / decisiveTrades) * 100 : 0

  const averageWin = winningTrades > 0 ? winAmountsTotal / winningTrades : 0
  const averageLoss = losingTrades > 0 ? lossAmountsTotal / losingTrades : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999.0 : 0
  const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : 0

  const winProb = winRate / 100
  const lossProb = lossRate / 100
  const expectancy = winProb * averageWin - lossProb * averageLoss

  const currentDrawdown = peakBalance - currentBalance
  const recoveryFactor = maxDrawdownAmount > 0 ? netProfit / maxDrawdownAmount : 0

  return {
    totalTrades: closedTrades.length,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate: Number(winRate.toFixed(2)),
    lossRate: Number(lossRate.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    averageWin: Number(averageWin.toFixed(2)),
    averageLoss: Number(averageLoss.toFixed(2)),
    riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
    expectancy: Number(expectancy.toFixed(2)),
    maxDrawdownAmount: Number(maxDrawdownAmount.toFixed(2)),
    maxDrawdownPercentage: Number(maxDrawdownPercentage.toFixed(2)),
    currentDrawdown: Number(currentDrawdown.toFixed(2)),
    consecutiveWins: currentConsecWins,
    consecutiveLosses: currentConsecLosses,
    maxConsecutiveWins: maxConsecWins,
    maxConsecutiveLosses: maxConsecLosses,
    recoveryFactor: Number(recoveryFactor.toFixed(2)),
    totalCommissions: Number(totalCommissions.toFixed(2)),
    totalSwap: Number(totalSwap.toFixed(2)),
  }
}

/**
 * Builds chronological equity and balance curve points.
 */
export function buildEquityCurve(trades: Trade[], initialBalance: number = 10000): EquityPoint[] {
  const closedTrades = trades
    .filter((t) => t.status === 'CLOSED' && t.exit_time)
    .sort((a, b) => new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime())

  const points: EquityPoint[] = [
    {
      date: closedTrades.length > 0 && closedTrades[0].entry_time ? closedTrades[0].entry_time : new Date().toISOString(),
      tradeNumber: 0,
      symbol: 'START',
      balance: initialBalance,
      equity: initialBalance,
      drawdown: 0,
      drawdownPct: 0,
      netPnl: 0,
      cumulativePnl: 0,
    },
  ]

  let runningBalance = initialBalance
  let peakBalance = initialBalance
  let cumulativePnl = 0

  closedTrades.forEach((trade, index) => {
    const netPnl = Number(trade.net_pnl) || 0
    runningBalance += netPnl
    cumulativePnl += netPnl

    if (runningBalance > peakBalance) {
      peakBalance = runningBalance
    }

    const drawdown = peakBalance - runningBalance
    const drawdownPct = peakBalance > 0 ? (drawdown / peakBalance) * 100 : 0

    points.push({
      date: trade.exit_time!,
      tradeNumber: index + 1,
      symbol: trade.symbol,
      balance: Number(runningBalance.toFixed(2)),
      equity: Number(runningBalance.toFixed(2)),
      drawdown: Number(drawdown.toFixed(2)),
      drawdownPct: Number(drawdownPct.toFixed(2)),
      netPnl: Number(netPnl.toFixed(2)),
      cumulativePnl: Number(cumulativePnl.toFixed(2)),
    })
  })

  return points
}

/**
 * Aggregates daily trading performance for heatmap and calendars.
 */
export function buildDailyPerformance(trades: Trade[]): DailyPerformance[] {
  const dailyMap = new Map<string, { netPnl: number; tradesCount: number; winCount: number; lossCount: number }>()

  trades
    .filter((t) => t.status === 'CLOSED' && t.exit_time)
    .forEach((trade) => {
      const dateKey = trade.exit_time!.split('T')[0]
      const existing = dailyMap.get(dateKey) || { netPnl: 0, tradesCount: 0, winCount: 0, lossCount: 0 }
      const netPnl = Number(trade.net_pnl) || 0

      existing.netPnl += netPnl
      existing.tradesCount++
      if (netPnl > 0.0001) existing.winCount++
      if (netPnl < -0.0001) existing.lossCount++

      dailyMap.set(dateKey, existing)
    })

  return Array.from(dailyMap.entries())
    .map(([date, data]) => {
      const decisive = data.winCount + data.lossCount
      const winRate = decisive > 0 ? (data.winCount / decisive) * 100 : 0
      return {
        date,
        netPnl: Number(data.netPnl.toFixed(2)),
        tradesCount: data.tradesCount,
        winCount: data.winCount,
        lossCount: data.lossCount,
        winRate: Number(winRate.toFixed(2)),
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Categorical breakdown helper for Analytics (e.g. by symbol, strategy, session, direction, weekday).
 */
export function buildCategoryBreakdown(trades: Trade[], keyExtractor: (trade: Trade) => string): BreakdownStat[] {
  const groups = new Map<string, Trade[]>()

  trades.forEach((trade) => {
    const key = keyExtractor(trade) || 'Unspecified'
    const list = groups.get(key) || []
    list.push(trade)
    groups.set(key, list)
  })

  return Array.from(groups.entries()).map(([category, groupTrades]) => {
    const summary = calculateMetricSummary(groupTrades, 0)
    return {
      category,
      tradesCount: groupTrades.length,
      winRate: summary.winRate,
      netPnl: summary.netProfit,
      profitFactor: summary.profitFactor,
      averagePnl: groupTrades.length > 0 ? Number((summary.netProfit / groupTrades.length).toFixed(2)) : 0,
    }
  }).sort((a, b) => b.netPnl - a.netPnl)
}
