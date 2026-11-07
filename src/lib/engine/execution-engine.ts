export interface BrokerDeal {
  dealTicket: string
  orderTicket?: string
  positionTicket?: string
  symbol: string
  direction: 'BUY' | 'SELL'
  entryType: 'IN' | 'OUT' | 'INOUT' // IN = open/scale-in, OUT = close/scale-out, INOUT = reversal
  quantity: number
  price: number
  commission: number
  swap: number
  profit: number
  time: string // ISO string UTC
  comment?: string
}

export interface ExecutionFill {
  ticket: string
  side: 'BUY' | 'SELL'
  price: number
  quantity: number
  commission: number
  swap: number
  time: string
  comment?: string
}

export interface AggregatedTradePosition {
  id?: string
  symbol: string
  direction: 'BUY' | 'SELL'
  totalVolumeOpened: number
  totalVolumeClosed: number
  remainingVolume: number
  weightedAverageEntryPrice: number
  weightedAverageExitPrice?: number
  openTime: string
  closeTime?: string
  status: 'OPEN' | 'CLOSED'
  grossPnl: number
  commission: number
  swap: number
  netPnl: number
  executionTickets: string[]
  executions: ExecutionFill[]
}

/**
 * Universal Position & Execution Aggregator
 * Processes raw broker deals/executions and aggregates them into accurate positions,
 * handling scale-ins, scale-outs (partial exits), and reversals.
 */
export class UniversalExecutionAggregator {
  private openPositionsMap = new Map<string, AggregatedTradePosition>() // keyed by symbol or position ticket
  private completedTrades: AggregatedTradePosition[] = []

  processDeals(deals: BrokerDeal[]): { openPositions: AggregatedTradePosition[]; closedTrades: AggregatedTradePosition[] } {
    // Sort deals chronologically
    const sortedDeals = [...deals].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    )

    for (const deal of sortedDeals) {
      const positionKey = deal.positionTicket || deal.symbol

      if (deal.entryType === 'IN') {
        // Position Entry / Scale-In
        this.handleScaleIn(positionKey, deal)
      } else if (deal.entryType === 'OUT') {
        // Position Exit / Partial Scale-Out
        this.handleScaleOut(positionKey, deal)
      } else if (deal.entryType === 'INOUT') {
        // Position Reversal: close current position and open opposite
        this.handleReversal(positionKey, deal)
      } else {
        // Default heuristics if entryType is unspecified
        const existing = this.openPositionsMap.get(positionKey)
        if (!existing || existing.status === 'CLOSED') {
          this.handleScaleIn(positionKey, deal)
        } else if (existing.direction === deal.direction) {
          this.handleScaleIn(positionKey, deal)
        } else {
          this.handleScaleOut(positionKey, deal)
        }
      }
    }

    return {
      openPositions: Array.from(this.openPositionsMap.values()).filter((p) => p.status === 'OPEN'),
      closedTrades: this.completedTrades,
    }
  }

  private handleScaleIn(positionKey: string, deal: BrokerDeal) {
    const existing = this.openPositionsMap.get(positionKey)
    const fill: ExecutionFill = {
      ticket: deal.dealTicket,
      side: deal.direction,
      price: deal.price,
      quantity: deal.quantity,
      commission: Number(deal.commission || 0),
      swap: Number(deal.swap || 0),
      time: deal.time,
      comment: deal.comment,
    }

    if (!existing || existing.status === 'CLOSED') {
      const newPos: AggregatedTradePosition = {
        symbol: deal.symbol,
        direction: deal.direction,
        totalVolumeOpened: deal.quantity,
        totalVolumeClosed: 0,
        remainingVolume: deal.quantity,
        weightedAverageEntryPrice: deal.price,
        openTime: deal.time,
        status: 'OPEN',
        grossPnl: 0,
        commission: fill.commission,
        swap: fill.swap,
        netPnl: -(Math.abs(fill.commission) + Math.abs(fill.swap)),
        executionTickets: [deal.dealTicket],
        executions: [fill],
      }
      this.openPositionsMap.set(positionKey, newPos)
    } else {
      // Scale-in to existing position: update weighted average entry price
      const totalCost =
        existing.weightedAverageEntryPrice * existing.remainingVolume + deal.price * deal.quantity
      const newVolume = existing.remainingVolume + deal.quantity

      existing.weightedAverageEntryPrice = totalCost / newVolume
      existing.totalVolumeOpened += deal.quantity
      existing.remainingVolume = newVolume
      existing.commission += fill.commission
      existing.swap += fill.swap
      existing.executionTickets.push(deal.dealTicket)
      existing.executions.push(fill)
    }
  }

  private handleScaleOut(positionKey: string, deal: BrokerDeal) {
    const existing = this.openPositionsMap.get(positionKey)
    const fill: ExecutionFill = {
      ticket: deal.dealTicket,
      side: deal.direction,
      price: deal.price,
      quantity: deal.quantity,
      commission: Number(deal.commission || 0),
      swap: Number(deal.swap || 0),
      time: deal.time,
      comment: deal.comment,
    }

    if (!existing) {
      // Standalone closing deal without open record
      const trade: AggregatedTradePosition = {
        symbol: deal.symbol,
        direction: deal.direction === 'BUY' ? 'SELL' : 'BUY',
        totalVolumeOpened: deal.quantity,
        totalVolumeClosed: deal.quantity,
        remainingVolume: 0,
        weightedAverageEntryPrice: deal.price,
        weightedAverageExitPrice: deal.price,
        openTime: deal.time,
        closeTime: deal.time,
        status: 'CLOSED',
        grossPnl: Number(deal.profit || 0),
        commission: fill.commission,
        swap: fill.swap,
        netPnl: Number(deal.profit || 0) + fill.commission + fill.swap,
        executionTickets: [deal.dealTicket],
        executions: [fill],
      }
      this.completedTrades.push(trade)
      return
    }

    existing.totalVolumeClosed += deal.quantity
    existing.remainingVolume = Math.max(0, existing.remainingVolume - deal.quantity)
    existing.commission += fill.commission
    existing.swap += fill.swap
    existing.grossPnl += Number(deal.profit || 0)
    existing.netPnl = existing.grossPnl + existing.commission + existing.swap
    existing.executionTickets.push(deal.dealTicket)
    existing.executions.push(fill)
    existing.weightedAverageExitPrice = deal.price

    if (existing.remainingVolume <= 0.00001) {
      existing.status = 'CLOSED'
      existing.closeTime = deal.time
      this.completedTrades.push({ ...existing })
      this.openPositionsMap.delete(positionKey)
    }
  }

  private handleReversal(positionKey: string, deal: BrokerDeal) {
    const existing = this.openPositionsMap.get(positionKey)
    if (!existing) {
      this.handleScaleIn(positionKey, deal)
      return
    }

    // Close the current remaining volume first
    const closingVolume = Math.min(existing.remainingVolume, deal.quantity)
    const remainingNewVolume = deal.quantity - closingVolume

    this.handleScaleOut(positionKey, {
      ...deal,
      quantity: closingVolume,
    })

    // Open remainder in the opposite direction
    if (remainingNewVolume > 0.00001) {
      this.handleScaleIn(positionKey, {
        ...deal,
        quantity: remainingNewVolume,
      })
    }
  }
}

