import { NextRequest, NextResponse } from 'next/server'
import { hashBridgeToken, checkRateLimit } from '@/lib/security/bridge-tokens'
import { createClient } from '@/lib/supabase/server'
import {
  UniversalExecutionAggregator,
  BrokerDealSchema,
  BrokerDeal,
  AggregatedTradePosition,
} from '@/lib/engine/execution-engine'
import { z } from 'zod'
import { reconcileAccountBalance } from '@/lib/dal/accounts'

const WebhookBatchSchema = z.object({
  deals: z.array(z.any()).min(1, 'Payload must include at least one deal record.'),
  server: z.string().optional(),
})

/**
 * Universal MT4/MT5 Webhook Endpoint
 * Institutional-grade security, Zod schema validation, durable execution idempotency,
 * and cross-batch position aggregation.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting by IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateCheck = checkRateLimit(`wh_${ip}`, 60, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests: Rate limit exceeded. Try again in 60 seconds.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // 2. Authorization Header Format Check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Authorization header.' },
        { status: 401 }
      )
    }

    const rawToken = authHeader.replace('Bearer ', '').trim()
    if (!rawToken || !rawToken.startsWith('klj_live_') || rawToken.length < 48) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid bridge token structure.' },
        { status: 401 }
      )
    }

    // 3. Database Integration & Token Verification
    let tokenHash: string
    try {
      tokenHash = hashBridgeToken(rawToken)
    } catch (secErr: any) {
      return NextResponse.json(
        { error: 'Server Security Failure: Bridge secret configuration missing.' },
        { status: 500 }
      )
    }

    const supabase = createClient()
    const { data: integration, error: intErr } = await supabase
      .from('integrations')
      .select('id, user_id, account_id, status, sync_mode')
      .eq('bridge_token_hash', tokenHash)
      .single()

    if (intErr || !integration) {
      return NextResponse.json(
        { error: 'Unauthorized: Bridge token not recognized or revoked.' },
        { status: 401 }
      )
    }

    if (integration.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'Unauthorized: Bridge integration token has been revoked.' },
        { status: 401 }
      )
    }

    // 4. Resolve Trusted Account & User ID (Never trust client-supplied account_id)
    const resolvedAccountId = integration.account_id
    const resolvedUserId = integration.user_id

    // 5. Payload Validation with Zod
    const rawBody = await req.json().catch(() => null)
    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON payload received.' }, { status: 400 })
    }

    // Support both { deals: [...] } and single deal {...}
    const normalizedDealsArray = Array.isArray(rawBody.deals)
      ? rawBody.deals
      : Array.isArray(rawBody)
      ? rawBody
      : [rawBody]

    const parsedDeals: BrokerDeal[] = []
    const validationErrors: string[] = []

    normalizedDealsArray.forEach((item: any, idx: number) => {
      // Map field aliases if raw broker exporter uses different naming
      const candidate = {
        dealTicket: item.ticket ?? item.deal ?? item.deal_id,
        orderTicket: item.order ?? item.order_id,
        positionTicket: item.position ?? item.position_id,
        symbol: item.symbol ?? item.item,
        direction: item.direction ?? item.type ?? item.cmd,
        entryType: item.entryType ?? item.entry ?? item.entry_type,
        quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.volume || item.lots || '0'),
        price: typeof item.price === 'number' ? item.price : parseFloat(item.open_price || item.close_price || '0'),
        commission: typeof item.commission === 'number' ? item.commission : parseFloat(item.commission || '0'),
        swap: typeof item.swap === 'number' ? item.swap : parseFloat(item.swap || '0'),
        profit: typeof item.profit === 'number' ? item.profit : parseFloat(item.profit || '0'),
        time: item.time ? new Date(item.time).toISOString() : new Date().toISOString(),
        comment: item.comment,
      }

      const res = BrokerDealSchema.safeParse(candidate)
      if (res.success) {
        parsedDeals.push(res.data)
      } else {
        validationErrors.push(`Item #${idx + 1}: ${res.error.issues.map((i) => i.message).join(', ')}`)
      }
    })

    if (validationErrors.length > 0 && parsedDeals.length === 0) {
      return NextResponse.json(
        { error: 'Payload Validation Failed', details: validationErrors },
        { status: 400 }
      )
    }

    // 6. Durable Per-Execution Idempotency Check
    const incomingTickets = parsedDeals.map((d) => d.dealTicket)
    const { data: existingExecutions } = await supabase
      .from('trade_executions')
      .select('ticket')
      .eq('account_id', resolvedAccountId)
      .in('ticket', incomingTickets)

    const existingTicketSet = new Set((existingExecutions || []).map((e: any) => e.ticket))
    const freshDeals = parsedDeals.filter((d) => !existingTicketSet.has(d.dealTicket))

    if (freshDeals.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All incoming deal executions have already been processed (idempotent skip).',
        processed: 0,
        skipped: parsedDeals.length,
      })
    }

    // 7. Cross-Batch Position Aggregation
    // Fetch currently OPEN positions for this account to maintain cross-batch continuity
    const { data: openTradesFromDB } = await supabase
      .from('trades')
      .select('*')
      .eq('account_id', resolvedAccountId)
      .eq('status', 'OPEN')

    const initialOpenPositions: AggregatedTradePosition[] = (openTradesFromDB || []).map((t: any) => ({
      id: t.id,
      positionTicket: t.source_ticket,
      symbol: t.symbol,
      direction: t.direction,
      totalVolumeOpened: Number(t.quantity),
      totalVolumeClosed: 0,
      remainingVolume: Number(t.quantity),
      weightedAverageEntryPrice: Number(t.entry_price),
      openTime: t.entry_time,
      status: 'OPEN',
      grossPnl: Number(t.gross_pnl || 0),
      commission: Number(t.commission || 0),
      swap: Number(t.swap || 0),
      fees: Number(t.fees || 0),
      netPnl: Number(t.net_pnl || 0),
      executionTickets: t.source_ticket ? [t.source_ticket] : [],
      executions: [],
    }))

    const aggregator = new UniversalExecutionAggregator(initialOpenPositions)
    const { openPositions, closedTrades } = aggregator.processDeals(freshDeals)

    // 8. Persist Executions, Positions, and Trades to PostgreSQL
    const executionInserts = freshDeals.map((d) => ({
      account_id: resolvedAccountId,
      provider: 'MT5',
      ticket: d.dealTicket,
      side: d.direction,
      price: d.price,
      quantity: d.quantity,
      commission: d.commission,
      swap: d.swap,
      execution_time: d.time,
      comment: d.comment,
    }))

    const { error: execInsertErr } = await supabase
      .from('trade_executions')
      .insert(executionInserts as any)

    if (execInsertErr) {
      console.error('Failed to store trade executions in database:', execInsertErr)
      return NextResponse.json(
        { error: 'Database write error persisting executions.' },
        { status: 500 }
      )
    }

    // Save newly closed trades
    if (closedTrades.length > 0) {
      const closedTradeRows = closedTrades.map((t) => ({
        user_id: resolvedUserId,
        account_id: resolvedAccountId,
        symbol: t.symbol,
        direction: t.direction,
        quantity: t.totalVolumeClosed,
        entry_price: t.weightedAverageEntryPrice,
        exit_price: t.weightedAverageExitPrice || t.weightedAverageEntryPrice,
        entry_time: t.openTime,
        exit_time: t.closeTime || new Date().toISOString(),
        status: 'CLOSED' as const,
        gross_pnl: t.grossPnl,
        commission: t.commission,
        swap: t.swap,
        fees: t.fees,
        net_pnl: t.netPnl,
        source: 'MT5_BRIDGE',
        source_ticket: t.executionTickets.join(','),
      }))

      const { data: savedTrades, error: tradesErr } = await supabase
        .from('trades')
        .insert(closedTradeRows)
        .select('id, net_pnl, symbol, source_ticket')

      if (tradesErr) {
        console.error('Failed to save closed trades:', tradesErr)
        return NextResponse.json(
          { error: 'Database write error persisting completed trades.' },
          { status: 500 }
        )
      }

      // Record Ledger Entries in account_transactions
      if (savedTrades && savedTrades.length > 0) {
        const ledgerEntries = savedTrades.map((st: any) => ({
          account_id: resolvedAccountId,
          user_id: resolvedUserId,
          trade_id: st.id,
          transaction_type: 'REALIZED_PNL' as const,
          amount: Number(st.net_pnl),
          currency: 'USD',
          reference_ticket: st.source_ticket,
          description: `MT5 Realized P&L on ${st.symbol}`,
          transaction_time: new Date().toISOString(),
        }))

        await supabase.from('account_transactions').insert(ledgerEntries as any)
      }
    }

    // 9. Update Integration Status to CONNECTED and update heartbeat
    await supabase
      .from('integrations')
      .update({
        status: 'CONNECTED',
        last_sync_at: new Date().toISOString(),
        last_ping_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id)

    // 10. Reconcile Account Balance
    await reconcileAccountBalance(resolvedAccountId)

    return NextResponse.json({
      success: true,
      message: 'Executions processed and persisted successfully.',
      dealsProcessed: freshDeals.length,
      closedTrades: closedTrades.length,
      openPositions: openPositions.length,
    })
  } catch (error: any) {
    console.error('Webhook Unexpected Exception:', error)
    return NextResponse.json(
      { error: 'Internal Server Error processing executions.' },
      { status: 500 }
    )
  }
}
