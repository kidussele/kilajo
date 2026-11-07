import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']

export async function getCurrentUser() {
  const supabase = createBrowserSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createBrowserSupabase()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    // If profile does not exist yet, initialize it
    const newProfile: Database['public']['Tables']['profiles']['Insert'] = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader',
      timezone: 'UTC',
      base_currency: 'USD',
      theme_preference: 'light',
    }

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select('*')
      .single()

    if (insertError) return null
    return inserted
  }

  return data
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
  const supabase = createBrowserSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }
  return data
}

export async function signOutUser() {
  const supabase = createBrowserSupabase()
  await supabase.auth.signOut()
}
