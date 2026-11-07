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

  if (error) {
    console.error('Error creating account:', error)
    return null
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
 * Reconciles the account balance mathematically from its initial balance + all closed trades.
 * This ensures no balance corruption happens during trade editing, deletions, or imports.
 */
export async function reconcileAccountBalance(accountId: string): Promise<number | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Get initial balance
  const { data: acc, error: accErr } = await supabase
    .from('trading_accounts')
    .select('initial_balance')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (accErr || !acc) return null

  // 2. Sum net_pnl of all closed trades
  const { data: trades, error: tradesErr } = await supabase
    .from('trades')
    .select('net_pnl')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .eq('status', 'CLOSED')

  if (tradesErr) return null

  const totalRealizedPnl = (trades || []).reduce((sum, t) => sum + Number(t.net_pnl || 0), 0)
  const reconciledBalance = Number(acc.initial_balance) + totalRealizedPnl

  // 3. Update account record
  await supabase
    .from('trading_accounts')
    .update({
      current_balance: Number(reconciledBalance.toFixed(4)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('user_id', user.id)

  return reconciledBalance
}
