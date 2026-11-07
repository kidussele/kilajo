import { z } from 'zod'

/**
 * Standard MT4/MT5 Deal Type constants
 */
export enum MT5DealType {
  BUY = 0,
  SELL = 1,
  BALANCE = 2,
  CREDIT = 3,
  COMMISSION = 7,
}

/**
 * Standard MT5 Deal Entry constants
 */
export enum MT5DealEntry {
  IN = 0, // Market entry / scale-in
  OUT = 1, // Market exit / scale-out
  INOUT = 2, // Reversal
  OUT_BY = 3, // Close by opposite
}

/**
 * Zod Schema for Incoming Deal Validation
 */
export const BrokerDealSchema = z.object({
  dealTicket: z.union([z.string(), z.number()]).transform(String),
  orderTicket: z.union([z.string(), z.number()]).optional().transform((v) => (v ? String(v) : undefined)),
  positionTicket: z.union([z.string(), z.number()]).optional().transform((v) => (v ? String(v) : undefined)),
  symbol: z.string().min(1, 'Symbol is required').transform((s) => s.trim().toUpperCase()),
  direction: z.union([
    z.literal('BUY'),
    z.literal('SELL'),
    z.literal(0),
    z.literal(1),
    z.literal('0'),
    z.literal('1'),
  ]).transform((val): 'BUY' | 'SELL' => {
    if (val === 'BUY' || val === 0 || val === '0') return 'BUY'
    if (val === 'SELL' || val === 1 || val === '1') return 'SELL'
    throw new Error(`Unrecognized deal direction: ${val}`)
  }),
  entryType: z.union([
    z.literal('IN'),
    z.literal('OUT'),
    z.literal('INOUT'),
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal('0'),
    z.literal('1'),
    z.literal('2'),
  ]).transform((val): 'IN' | 'OUT' | 'INOUT' => {
    if (val === 'IN' || val === 0 || val === '0') return 'IN'
    if (val === 'OUT' || val === 1 || val === '1') return 'OUT'
    if (val === 'INOUT' || val === 2 || val === '2') return 'INOUT'
    throw new Error(`Unrecognized or unsupported MT4/MT5 entry code: ${val}`)
  }),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Execution price must be positive'),
  commission: z.number().default(0),
  swap: z.number().default(0),
  profit: z.number().default(0),
  time: z.string().datetime({ message: 'Execution time must be a valid ISO 8601 UTC timestamp' }),
  comment: z.string().optional(),
})

export type BrokerDeal = z.infer<typeof BrokerDealSchema>

export interface ExecutionFill {
  ticket: string
  orderTicket?: string
  positionTicket?: string
  side: 'BUY' | 'SELL'
  price: number
  quantity: number
  commission: number
  swap: number
  profit: number
  time: string
  comment?: string
}

export interface AggregatedTradePosition {
  id?: string
  positionTicket?: string
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
  fees: number
  netPnl: number
  executionTickets: string[]
  executions: ExecutionFill[]
}

/**
 * Universal Position & Execution Aggregator
 * Processes broker executions into journal positions across arbitrary batch boundaries.
 */
export class UniversalExecutionAggregator {
  private openPositionsMap = new Map<string, AggregatedTradePosition>()
  private completedTrades: AggregatedTradePosition[] = []

  /**
   * Initializes aggregator with previously persisted open positions from the database.
   * This guarantees cross-batch continuity between separate webhook payloads.
   */
  constructor(existingOpenPositions: AggregatedTradePosition[] = []) {
    existingOpenPositions.forEach((pos) => {
      const key = pos.positionTicket || `${pos.symbol}_${pos.direction}`
      this.openPositionsMap.set(key, { ...pos })
    })
  }

  processDeals(deals: BrokerDeal[]): {
    openPositions: AggregatedTradePosition[]
    closedTrades: AggregatedTradePosition[]
  } {
    // Sort deals strictly chronologically
    const sortedDeals = [...deals].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    )

    for (const deal of sortedDeals) {
      const positionKey = deal.positionTicket || `${deal.symbol}_${deal.direction}`

      switch (deal.entryType) {
        case 'IN':
          this.handleScaleIn(positionKey, deal)
          break
        case 'OUT':
          this.handleScaleOut(positionKey, deal)
          break
        case 'INOUT':
          this.handleReversal(positionKey, deal)
          break
        default:
          throw new Error(`Unmapped entryType encountered: ${(deal as any).entryType}`)
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
      orderTicket: deal.orderTicket,
      positionTicket: deal.positionTicket,
      side: deal.direction,
      price: deal.price,
      quantity: deal.quantity,
      commission: Number(deal.commission || 0),
      swap: Number(deal.swap || 0),
      profit: 0,
      time: deal.time,
      comment: deal.comment,
    }

    if (!existing || existing.status === 'CLOSED') {
      const newPos: AggregatedTradePosition = {
        positionTicket: deal.positionTicket,
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
        fees: 0,
        netPnl: fill.commission + fill.swap,
        executionTickets: [deal.dealTicket],
        executions: [fill],
      }
      this.openPositionsMap.set(positionKey, newPos)
    } else {
      // Scale-in to existing position: recalculate weighted average entry price
      const existingCost = existing.weightedAverageEntryPrice * existing.remainingVolume
      const addedCost = deal.price * deal.quantity
      const newRemainingVolume = existing.remainingVolume + deal.quantity

      existing.weightedAverageEntryPrice = (existingCost + addedCost) / newRemainingVolume
      existing.totalVolumeOpened += deal.quantity
      existing.remainingVolume = newRemainingVolume
      existing.commission += fill.commission
      existing.swap += fill.swap
      existing.netPnl = existing.grossPnl + existing.commission + existing.swap
      existing.executionTickets.push(deal.dealTicket)
      existing.executions.push(fill)
    }
  }

  private handleScaleOut(positionKey: string, deal: BrokerDeal) {
    let existing = this.openPositionsMap.get(positionKey)

    // If matching by position ticket failed, search open position with same symbol
    if (!existing) {
      Array.from(this.openPositionsMap.entries()).forEach(([k, pos]) => {
        if (!existing && pos.symbol === deal.symbol && pos.status === 'OPEN') {
          existing = pos
          positionKey = k
        }
      })
    }

    const fill: ExecutionFill = {
      ticket: deal.dealTicket,
      orderTicket: deal.orderTicket,
      positionTicket: deal.positionTicket,
      side: deal.direction,
      price: deal.price,
      quantity: deal.quantity,
      commission: Number(deal.commission || 0),
      swap: Number(deal.swap || 0),
      profit: Number(deal.profit || 0),
      time: deal.time,
      comment: deal.comment,
    }

    if (!existing) {
      // Standalone closing deal without prior open record
      const standaloneTrade: AggregatedTradePosition = {
        positionTicket: deal.positionTicket,
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
        grossPnl: fill.profit,
        commission: fill.commission,
        swap: fill.swap,
        fees: 0,
        netPnl: fill.profit + fill.commission + fill.swap,
        executionTickets: [deal.dealTicket],
        executions: [fill],
      }
      this.completedTrades.push(standaloneTrade)
      return
    }

    // Scale-out calculation
    const closedVolume = Math.min(existing.remainingVolume, deal.quantity)
    const newClosedTotal = existing.totalVolumeClosed + closedVolume
    const prevExitPrice = existing.weightedAverageExitPrice || deal.price

    // Calculate exit weighted average
    existing.weightedAverageExitPrice =
      existing.totalVolumeClosed > 0
        ? (prevExitPrice * existing.totalVolumeClosed + deal.price * closedVolume) / newClosedTotal
        : deal.price

    existing.totalVolumeClosed = newClosedTotal
    existing.remainingVolume = Math.max(0, existing.remainingVolume - closedVolume)
    existing.commission += fill.commission
    existing.swap += fill.swap
    existing.grossPnl += fill.profit
    existing.netPnl = existing.grossPnl + existing.commission + existing.swap
    existing.executionTickets.push(deal.dealTicket)
    existing.executions.push(fill)

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
      this.handleScaleIn(positionKey, { ...deal, entryType: 'IN' })
      return
    }

    const closingVolume = Math.min(existing.remainingVolume, deal.quantity)
    const openingVolume = deal.quantity - closingVolume

    // Close old position
    this.handleScaleOut(positionKey, {
      ...deal,
      entryType: 'OUT',
      quantity: closingVolume,
    })

    // Open remainder in opposing direction
    if (openingVolume > 0.00001) {
      const opposingDirection: 'BUY' | 'SELL' = deal.direction
      const newKey = deal.positionTicket || `${deal.symbol}_${opposingDirection}`
      this.handleScaleIn(newKey, {
        ...deal,
        entryType: 'IN',
        direction: opposingDirection,
        quantity: openingVolume,
      })
    }
  }
}
