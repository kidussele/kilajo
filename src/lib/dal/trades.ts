import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import { Trade, TradeInsert, TradeUpdate, TradeFilter } from '@/types/trading'
import { reconcileAccountBalance } from './accounts'

export async function fetchUserTrades(filter?: TradeFilter): Promise<Trade[]> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)

  if (filter?.accountId && filter.accountId !== 'ALL') {
    query = query.eq('account_id', filter.accountId)
  }
  if (filter?.symbol) {
    query = query.ilike('symbol', `%${filter.symbol}%`)
  }
  if (filter?.direction) {
    query = query.eq('direction', filter.direction)
  }
  if (filter?.status) {
    query = query.eq('status', filter.status)
  }
  if (filter?.session && filter.session !== 'ALL') {
    query = query.eq('session', filter.session)
  }
  if (filter?.strategyId) {
    query = query.eq('strategy_id', filter.strategyId)
  }

  const sortBy = filter?.sortBy || 'exit_time'
  const isAsc = filter?.sortOrder === 'asc'
  query = query.order(sortBy, { ascending: isAsc, nullsFirst: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching trades:', error)
    return []
  }

  return (data || []) as Trade[]
}

export async function addTradeDB(
  tradeData: Omit<TradeInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Trade | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const payload: TradeInsert = {
    ...tradeData,
    user_id: user.id,
  }

  const { data, error } = await supabase
    .from('trades')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    console.error('Error adding trade:', error)
    return null
  }

  // Record realized P&L in the financial ledger if the trade is closed
  if (data && data.status === 'CLOSED' && data.net_pnl !== null && data.net_pnl !== undefined) {
    await supabase.from('account_transactions').insert({
      account_id: data.account_id,
      user_id: user.id,
      trade_id: data.id,
      transaction_type: 'REALIZED_PNL',
      amount: Number(data.net_pnl),
      currency: 'USD',
      reference_ticket: data.source_ticket || data.id,
      description: `Trade ${data.symbol} (${data.direction}) P&L`,
      transaction_time: data.exit_time || data.created_at,
    })
  }

  // Reconcile account balance after addition
  if (tradeData.account_id) {
    await reconcileAccountBalance(tradeData.account_id)
  }

  return data as Trade
}

export async function updateTradeDB(
  id: string,
  updates: TradeUpdate
): Promise<Trade | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch the current trade to obtain its account_id
  const { data: currentTrade } = await supabase
    .from('trades')
    .select('account_id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { data, error } = await supabase
    .from('trades')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating trade:', error)
    return null
  }

  // Synchronize transaction ledger with trade updates
  if (data) {
    if (data.status === 'CLOSED' && data.net_pnl !== null && data.net_pnl !== undefined) {
      const { data: existingTx } = await supabase
        .from('account_transactions')
        .select('id')
        .eq('trade_id', id)
        .eq('transaction_type', 'REALIZED_PNL')
        .maybeSingle()

      if (existingTx) {
        await supabase
          .from('account_transactions')
          .update({
            account_id: data.account_id,
            amount: Number(data.net_pnl),
            transaction_time: data.exit_time || data.created_at,
            description: `Trade ${data.symbol} (${data.direction}) P&L (Updated)`,
          })
          .eq('id', existingTx.id)
      } else {
        await supabase.from('account_transactions').insert({
          account_id: data.account_id,
          user_id: user.id,
          trade_id: data.id,
          transaction_type: 'REALIZED_PNL',
          amount: Number(data.net_pnl),
          currency: 'USD',
          reference_ticket: data.source_ticket || data.id,
          description: `Trade ${data.symbol} (${data.direction}) P&L`,
          transaction_time: data.exit_time || data.created_at,
        })
      }
    } else if (data.status === 'OPEN') {
      // Reverted to open, remove realized P&L transaction
      await supabase
        .from('account_transactions')
        .delete()
        .eq('trade_id', id)
        .eq('transaction_type', 'REALIZED_PNL')
    }
  }

  // Reconcile account balance after update
  const targetAcc = updates.account_id || currentTrade?.account_id
  if (targetAcc) {
    await reconcileAccountBalance(targetAcc)
  }

  return data as Trade
}

export async function deleteTradeDB(id: string): Promise<boolean> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Fetch the current trade to know which account balance to reconcile
  const { data: currentTrade } = await supabase
    .from('trades')
    .select('account_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  // Clean up any ledger transactions associated with this trade before deleting
  await supabase
    .from('account_transactions')
    .delete()
    .eq('trade_id', id)
    .eq('user_id', user.id)

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting trade:', error)
    return false
  }

  // Reconcile account balance after deletion
  if (currentTrade?.account_id) {
    await reconcileAccountBalance(currentTrade.account_id)
  }

  return true
}

export async function bulkAddTradesDB(
  tradesData: Omit<TradeInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
): Promise<{ added: number; duplicates: number }> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || tradesData.length === 0) return { added: 0, duplicates: 0 }

  const accountId = tradesData[0].account_id

  // Fetch existing tickets for this account to prevent duplicate imports
  const { data: existingTrades } = await supabase
    .from('trades')
    .select('source_ticket')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .not('source_ticket', 'is', null)

  const existingTicketSet = new Set((existingTrades || []).map((t) => t.source_ticket))

  let duplicateCount = 0
  const validPayloads: TradeInsert[] = []

  tradesData.forEach((t) => {
    if (t.source_ticket && existingTicketSet.has(t.source_ticket)) {
      duplicateCount++
      return
    }

    if (t.source_ticket) {
      existingTicketSet.add(t.source_ticket)
    }

    validPayloads.push({
      ...t,
      user_id: user.id,
    })
  })

  if (validPayloads.length > 0) {
    const { data: insertedTrades, error } = await supabase
      .from('trades')
      .insert(validPayloads)
      .select('id, account_id, net_pnl, symbol, direction, source_ticket, status, exit_time, created_at')

    if (error) {
      console.error('Error during bulk trade insertion:', error)
      return { added: 0, duplicates: duplicateCount }
    }

    // Record realized P&L for any closed trades inserted
    const closedTrades = (insertedTrades || []).filter((t: any) => t.status === 'CLOSED' && t.net_pnl !== null)
    if (closedTrades.length > 0) {
      const ledgerEntries = closedTrades.map((ct: any) => ({
        account_id: ct.account_id,
        user_id: user.id,
        trade_id: ct.id,
        transaction_type: 'REALIZED_PNL' as const,
        amount: Number(ct.net_pnl),
        currency: 'USD',
        reference_ticket: ct.source_ticket || ct.id,
        description: `Imported Trade ${ct.symbol} P&L`,
        transaction_time: ct.exit_time || ct.created_at,
      }))
      await supabase.from('account_transactions').insert(ledgerEntries as any)
    }

    // Reconcile account balance
    await reconcileAccountBalance(accountId)
  }

  return { added: validPayloads.length, duplicates: duplicateCount }
}

