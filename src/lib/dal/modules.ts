import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import { Strategy, PropFirmRule, PsychologyLog, Goal } from '@/types/trading'
import { Database } from '@/types/database'

// --- STRATEGIES ---
export async function fetchUserStrategies(): Promise<Strategy[]> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) return []
  return (data || []) as Strategy[]
}

export async function addStrategyDB(
  strategy: Omit<Database['public']['Tables']['strategies']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Strategy | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('strategies')
    .insert({ ...strategy, user_id: user.id })
    .select('*')
    .single()

  if (error) return null
  return data as Strategy
}

// --- PROP FIRM RULES ---
export async function fetchUserPropRules(): Promise<PropFirmRule[]> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('prop_firm_rules')
    .select('*')

  if (error) return []
  return (data || []) as PropFirmRule[]
}

export async function updatePropRuleDB(
  accountId: string,
  updates: Partial<PropFirmRule>
): Promise<PropFirmRule | null> {
  const supabase = createBrowserSupabase()
  const { data, error } = await supabase
    .from('prop_firm_rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('account_id', accountId)
    .select('*')
    .single()

  if (error) return null
  return data as PropFirmRule
}

// --- PSYCHOLOGY LOGS ---
export async function fetchUserPsychologyLogs(): Promise<PsychologyLog[]> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('psychology_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) return []
  return (data || []) as PsychologyLog[]
}

export async function addPsychologyLogDB(
  log: Omit<Database['public']['Tables']['psychology_logs']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<PsychologyLog | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('psychology_logs')
    .upsert(
      { ...log, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    )
    .select('*')
    .single()

  if (error) return null
  return data as PsychologyLog
}

// --- GOALS ---
export async function fetchUserGoals(): Promise<Goal[]> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data || []) as Goal[]
}

export async function addGoalDB(
  goal: Omit<Database['public']['Tables']['goals']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Goal | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('goals')
    .insert({ ...goal, user_id: user.id })
    .select('*')
    .single()

  if (error) return null
  return data as Goal
}

export async function updateGoalDB(
  id: string,
  updates: Partial<Goal>
): Promise<Goal | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return null
  return data as Goal
}

