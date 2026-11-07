import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import { TradingAccount, TradingAccountInsert, TradingAccountUpdate } from '@/types/trading'

export async function fetchUserAccounts(): Promise<TradingAccount[]> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trading accounts:', error)
    return []
  }

  return (data || []) as TradingAccount[]
}

export async function createAccountDB(
  account: Omit<TradingAccountInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<TradingAccount | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const payload: TradingAccountInsert = {
    ...account,
    user_id: user.id,
    current_balance: account.initial_balance,
  }

  const { data, error } = await supabase
    .from('trading_accounts')
    .insert(payload)
    .select('*')
    .single()

  if (error || !data) {
    console.error('Error creating account:', error)
    return null
  }

  // Also record initial balance transaction in the ledger
  if (data.initial_balance) {
    await supabase.from('account_transactions').insert({
      account_id: data.id,
      user_id: user.id,
      transaction_type: 'INITIAL_BALANCE',
      amount: data.initial_balance,
      currency: data.currency || 'USD',
      description: `Initial balance for account ${data.account_name}`,
      transaction_time: data.created_at,
    })
  }

  return data as TradingAccount
}

export async function updateAccountDB(
  id: string,
  updates: TradingAccountUpdate
): Promise<TradingAccount | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('trading_accounts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating account:', error)
    return null
  }

  return data as TradingAccount
}

export async function deleteAccountDB(id: string): Promise<boolean> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('trading_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting account:', error)
    return false
  }

  return true
}

/**
 * Reconciles the account balance from the transaction ledger (account_transactions)
 * as the primary source of truth. If no ledger entries exist, gracefully falls back to
 * initial_balance + sum(closed trade net_pnl).
 */
export async function reconcileAccountBalance(accountId: string): Promise<number | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Check account transactions ledger first (Primary Financial Source of Truth)
  const { data: ledgerTxs, error: ledgerErr } = await supabase
    .from('account_transactions')
    .select('amount')
    .eq('account_id', accountId)
    .eq('user_id', user.id)

  let reconciledBalance: number

  if (!ledgerErr && ledgerTxs && ledgerTxs.length > 0) {
    // Sum all ledger entries (INITIAL_BALANCE, DEPOSITS, WITHDRAWALS, REALIZED_PNL, ADJUSTMENTS)
    reconciledBalance = ledgerTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  } else {
    // Fallback: Initial balance + Sum of closed trade net_pnl
    const { data: acc, error: accErr } = await supabase
      .from('trading_accounts')
      .select('initial_balance')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (accErr || !acc) return null

    const { data: trades, error: tradesErr } = await supabase
      .from('trades')
      .select('net_pnl')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .eq('status', 'CLOSED')

    if (tradesErr) return null

    const totalRealizedPnl = (trades || []).reduce((sum, t) => sum + Number(t.net_pnl || 0), 0)
    reconciledBalance = Number(acc.initial_balance) + totalRealizedPnl
  }

  // 2. Update account record with reconciled balance
  const roundedBalance = Number(reconciledBalance.toFixed(4))
  await supabase
    .from('trading_accounts')
    .update({
      current_balance: roundedBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('user_id', user.id)

  return roundedBalance
}

