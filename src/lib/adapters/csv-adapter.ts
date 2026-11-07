import Papa from 'papaparse'
import { BaseAdapter, NormalizedTrade, RawTradeRecord, AdapterResult, ValidationIssue } from './base-adapter'

export interface ColumnMapping {
  symbol: string
  direction: string
  quantity: string
  entryPrice: string
  exitPrice?: string
  stopLoss?: string
  takeProfit?: string
  entryTime: string
  exitTime?: string
  netPnl?: string
  grossPnl?: string
  commission?: string
  swap?: string
  ticket?: string
}

export class CsvAdapter extends BaseAdapter {
  name = 'Universal CSV/Excel Adapter'
  supportedFormats = ['.csv', '.tsv', '.txt']

  async parse(content: string): Promise<RawTradeRecord[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          resolve(results.data as RawTradeRecord[])
        },
        error: (err: any) => {
          reject(err)
        },
      })
    })
  }

  detectMapping(headers: string[]): Partial<ColumnMapping> {
    const mapping: Partial<ColumnMapping> = {}
    const lower = headers.map((h) => ({ original: h, lower: h.trim().toLowerCase().replace(/[^a-z0-9]/g, '') }))

    for (const item of lower) {
      const l = item.lower
      if (!mapping.symbol && (l === 'symbol' || l === 'item' || l === 'instrument' || l === 'ticker' || l === 'pair')) {
        mapping.symbol = item.original
      } else if (!mapping.direction && (l === 'type' || l === 'direction' || l === 'action' || l === 'side' || l === 'order')) {
        mapping.direction = item.original
      } else if (!mapping.quantity && (l === 'volume' || l === 'size' || l === 'lots' || l === 'quantity' || l === 'qty')) {
        mapping.quantity = item.original
      } else if (!mapping.entryPrice && (l === 'openprice' || l === 'entryprice' || l === 'price' || l === 'inprice')) {
        mapping.entryPrice = item.original
      } else if (!mapping.exitPrice && (l === 'closeprice' || l === 'exitprice' || l === 'outprice')) {
        mapping.exitPrice = item.original
      } else if (!mapping.stopLoss && (l === 'sl' || l === 'stoploss' || l === 'stop')) {
        mapping.stopLoss = item.original
      } else if (!mapping.takeProfit && (l === 'tp' || l === 'takeprofit' || l === 'target')) {
        mapping.takeProfit = item.original
      } else if (!mapping.entryTime && (l === 'opentime' || l === 'time' || l === 'entrytime' || l === 'date' || l === 'opened')) {
        mapping.entryTime = item.original
      } else if (!mapping.exitTime && (l === 'closetime' || l === 'exittime' || l === 'closed')) {
        mapping.exitTime = item.original
      } else if (!mapping.netPnl && (l === 'profit' || l === 'netprofit' || l === 'pnl' || l === 'netpnl' || l === 'pl')) {
        mapping.netPnl = item.original
      } else if (!mapping.commission && (l === 'commission' || l === 'comm' || l === 'fee' || l === 'fees')) {
        mapping.commission = item.original
      } else if (!mapping.swap && (l === 'swap' || l === 'rollover' || l === 'financing')) {
        mapping.swap = item.original
      } else if (!mapping.ticket && (l === 'ticket' || l === 'order' || l === 'deal' || l === 'id' || l === 'tradeid')) {
        mapping.ticket = item.original
      }
    }

    return mapping
  }

  normalize(records: RawTradeRecord[], customMapping?: Partial<ColumnMapping>): AdapterResult {
    const trades: NormalizedTrade[] = []
    const issues: ValidationIssue[] = []

    if (!records || records.length === 0) {
      return { trades: [], totalRows: 0, validRows: 0, invalidRows: 0, issues: [] }
    }

    const mapping = customMapping || this.detectMapping(Object.keys(records[0]))

    records.forEach((row, index) => {
      const rowNum = index + 1
      const symbolVal = mapping.symbol ? String(row[mapping.symbol] || '').trim().toUpperCase() : ''
      const directionVal = mapping.direction ? String(row[mapping.direction] || '').trim().toUpperCase() : ''
      const quantityVal = mapping.quantity ? parseFloat(String(row[mapping.quantity] || '0').replace(/[^0-9.-]/g, '')) : NaN
      const entryPriceVal = mapping.entryPrice ? parseFloat(String(row[mapping.entryPrice] || '0').replace(/[^0-9.-]/g, '')) : NaN
      const exitPriceVal = mapping.exitPrice ? parseFloat(String(row[mapping.exitPrice] || '0').replace(/[^0-9.-]/g, '')) : undefined
      const entryTimeRaw = mapping.entryTime ? String(row[mapping.entryTime] || '').trim() : ''
      const exitTimeRaw = mapping.exitTime ? String(row[mapping.exitTime] || '').trim() : undefined
      const pnlRaw = mapping.netPnl ? parseFloat(String(row[mapping.netPnl] || '0').replace(/[^0-9.-]/g, '')) : 0
      const commRaw = mapping.commission ? parseFloat(String(row[mapping.commission] || '0').replace(/[^0-9.-]/g, '')) : 0
      const swapRaw = mapping.swap ? parseFloat(String(row[mapping.swap] || '0').replace(/[^0-9.-]/g, '')) : 0
      const ticketVal = mapping.ticket ? String(row[mapping.ticket] || '').trim() : undefined

      // Validation
      if (!symbolVal) {
        issues.push({ row: rowNum, field: 'symbol', message: 'Missing symbol or instrument', severity: 'error' })
        return
      }

      let direction: 'BUY' | 'SELL' = 'BUY'
      if (directionVal.includes('SELL') || directionVal.includes('SHORT')) {
        direction = 'SELL'
      } else if (directionVal.includes('BUY') || directionVal.includes('LONG')) {
        direction = 'BUY'
      } else {
        issues.push({ row: rowNum, field: 'direction', message: `Invalid direction: ${directionVal}`, severity: 'error' })
        return
      }

      if (isNaN(quantityVal) || quantityVal <= 0) {
        issues.push({ row: rowNum, field: 'quantity', message: 'Invalid or missing quantity/volume', severity: 'error' })
        return
      }

      if (isNaN(entryPriceVal) || entryPriceVal <= 0) {
        issues.push({ row: rowNum, field: 'entryPrice', message: 'Invalid or missing entry price', severity: 'error' })
        return
      }

      const parsedEntryDate = new Date(entryTimeRaw)
      if (isNaN(parsedEntryDate.getTime())) {
        issues.push({ row: rowNum, field: 'entryTime', message: `Invalid entry timestamp: ${entryTimeRaw}`, severity: 'error' })
        return
      }

      let parsedExitDate: Date | undefined
      if (exitTimeRaw) {
        const d = new Date(exitTimeRaw)
        if (!isNaN(d.getTime())) parsedExitDate = d
      }

      const status: 'OPEN' | 'CLOSED' = parsedExitDate || (exitPriceVal !== undefined && !isNaN(exitPriceVal)) ? 'CLOSED' : 'OPEN'
      const netPnl = isNaN(pnlRaw) ? 0 : pnlRaw
      const commission = isNaN(commRaw) ? 0 : commRaw
      const swap = isNaN(swapRaw) ? 0 : swapRaw
      const grossPnl = netPnl - commission - swap

      trades.push({
        sourceTicket: ticketVal,
        symbol: symbolVal,
        direction,
        quantity: quantityVal,
        entryPrice: entryPriceVal,
        exitPrice: isNaN(exitPriceVal as number) ? undefined : exitPriceVal,
        entryTime: parsedEntryDate.toISOString(),
        exitTime: parsedExitDate ? parsedExitDate.toISOString() : undefined,
        status,
        grossPnl: Number(grossPnl.toFixed(4)),
        commission: Number(commission.toFixed(4)),
        swap: Number(swap.toFixed(4)),
        fees: 0,
        netPnl: Number(netPnl.toFixed(4)),
        session: this.deriveSession(parsedEntryDate),
        rawRecord: row,
      })
    })

    return {
      trades,
      totalRows: records.length,
      validRows: trades.length,
      invalidRows: records.length - trades.length,
      issues,
    }
  }
}
