export interface RawTradeRecord {
  [key: string]: any
}

export interface NormalizedTrade {
  sourceTicket?: string
  symbol: string
  direction: 'BUY' | 'SELL'
  quantity: number
  entryPrice: number
  exitPrice?: number
  stopLoss?: number
  takeProfit?: number
  entryTime: string // ISO string UTC
  exitTime?: string // ISO string UTC
  status: 'OPEN' | 'CLOSED'
  grossPnl: number
  commission: number
  swap: number
  fees: number
  netPnl: number
  session?: string
  notes?: string
  rawRecord?: RawTradeRecord
}

export interface ValidationIssue {
  row: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface AdapterResult {
  trades: NormalizedTrade[]
  totalRows: number
  validRows: number
  invalidRows: number
  issues: ValidationIssue[]
}

export abstract class BaseAdapter {
  abstract name: string
  abstract supportedFormats: string[]

  abstract parse(content: string | ArrayBuffer): Promise<RawTradeRecord[]>
  abstract normalize(records: RawTradeRecord[]): AdapterResult

  /**
   * Helper to derive trading session from UTC entry timestamp.
   */
  deriveSession(utcDate: Date): string {
    const hour = utcDate.getUTCHours()
    if (hour >= 0 && hour < 7) return 'Asian'
    if (hour >= 7 && hour < 12) return 'London'
    if (hour >= 12 && hour < 16) return 'London/NY Overlap'
    if (hour >= 16 && hour < 21) return 'New York'
    return 'Asian'
  }
}
