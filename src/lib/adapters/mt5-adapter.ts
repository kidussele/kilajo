import { BaseAdapter, NormalizedTrade, RawTradeRecord, AdapterResult } from './base-adapter'

export class MetaTrader5Adapter extends BaseAdapter {
  name = 'MetaTrader 5 Bridge & Report Adapter'
  supportedFormats = ['.html', '.csv', '.json']

  async parse(content: string): Promise<RawTradeRecord[]> {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(content)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        // Fall back to text parsing
      }
    }
    // HTML / CSV Report parsing fallback
    return []
  }

  normalize(records: RawTradeRecord[]): AdapterResult {
    const trades: NormalizedTrade[] = []

    records.forEach((rec) => {
      // Handle both EA JSON sync format and MT5 statement format
      const ticket = String(rec.ticket || rec.deal || rec.order || rec.deal_id || '')
      const symbol = String(rec.symbol || rec.item || '').toUpperCase().trim()
      const typeStr = String(rec.type || rec.cmd || '').toUpperCase().trim()
      const direction: 'BUY' | 'SELL' = typeStr.includes('SELL') || typeStr === '1' ? 'SELL' : 'BUY'
      
      const quantity = Math.abs(Number(rec.volume || rec.lots || rec.quantity || 0))
      const entryPrice = Number(rec.open_price || rec.price || rec.entry_price || 0)
      const exitPrice = rec.close_price ? Number(rec.close_price) : undefined
      const stopLoss = rec.sl ? Number(rec.sl) : undefined
      const takeProfit = rec.tp ? Number(rec.tp) : undefined

      const openTimeRaw = rec.open_time || rec.time || rec.entry_time || new Date().toISOString()
      const closeTimeRaw = rec.close_time || rec.exit_time
      const openDate = new Date(openTimeRaw)
      const closeDate = closeTimeRaw ? new Date(closeTimeRaw) : undefined

      const netPnl = Number(rec.profit || rec.net_profit || 0)
      const commission = Number(rec.commission || 0)
      const swap = Number(rec.swap || 0)
      const grossPnl = netPnl - commission - swap

      if (symbol && quantity > 0 && entryPrice > 0) {
        trades.push({
          sourceTicket: ticket || undefined,
          symbol,
          direction,
          quantity,
          entryPrice,
          exitPrice,
          stopLoss,
          takeProfit,
          entryTime: isNaN(openDate.getTime()) ? new Date().toISOString() : openDate.toISOString(),
          exitTime: closeDate && !isNaN(closeDate.getTime()) ? closeDate.toISOString() : undefined,
          status: closeDate ? 'CLOSED' : 'OPEN',
          grossPnl: Number(grossPnl.toFixed(4)),
          commission: Number(commission.toFixed(4)),
          swap: Number(swap.toFixed(4)),
          fees: 0,
          netPnl: Number(netPnl.toFixed(4)),
          session: this.deriveSession(isNaN(openDate.getTime()) ? new Date() : openDate),
          rawRecord: rec,
        })
      }
    })

    return {
      trades,
      totalRows: records.length,
      validRows: trades.length,
      invalidRows: records.length - trades.length,
      issues: [],
    }
  }
}

