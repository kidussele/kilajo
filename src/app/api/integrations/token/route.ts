import { NextRequest, NextResponse } from 'next/server'
import { generateBridgeToken, hashBridgeToken } from '@/lib/security/bridge-tokens'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/integrations/token
 * Generates and securely registers a cryptographic bridge token for an account.
 * Requires user authentication and account ownership verification.
 * Only the SHA-256 HMAC hash is persisted.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Server Environment Configuration (Fail closed)
    if (!process.env.BRIDGE_WEBHOOK_SECRET || process.env.BRIDGE_WEBHOOK_SECRET.length < 32) {
      return NextResponse.json(
        { error: 'Server security configuration error: BRIDGE_WEBHOOK_SECRET is not configured or is too short.' },
        { status: 500 }
      )
    }

    const supabase = createClient()

    // 2. Require Authenticated User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to manage integration bridge tokens.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { accountId, provider = 'MT5' } = body

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required.' }, { status: 400 })
    }

    // 3. Verify Account Ownership
    const { data: account, error: accErr } = await supabase
      .from('trading_accounts')
      .select('id, user_id, name')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (accErr || !account) {
      return NextResponse.json(
        { error: 'Forbidden: Trading account not found or access denied.' },
        { status: 403 }
      )
    }

    // 4. Generate Cryptographic Token & Hash
    const { rawToken, tokenHash } = generateBridgeToken()

    // 5. Store Token Hash in Database (Set status to PENDING, never mark CONNECTED before real sync)
    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert(
        {
          user_id: user.id,
          account_id: accountId,
          provider,
          bridge_token_hash: tokenHash,
          sync_mode: 'READ_ONLY',
          status: 'PENDING', // Awaiting first verified webhook push
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'account_id,provider' }
      )

    if (upsertError) {
      console.error('Failed to register integration token in database:', upsertError)
      return NextResponse.json(
        { error: 'Failed to securely store integration token in database. Action aborted.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      rawToken, // Sent once for user to configure in their MetaTrader terminal
      status: 'PENDING',
      message: 'Cryptographic bridge token generated and registered securely.',
    })
  } catch (error: any) {
    console.error('Integration Token Generation Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/integrations/token
 * Revokes an integration bridge token for a trading account.
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')
    const provider = searchParams.get('provider') || 'MT5'

    if (!accountId) {
      return NextResponse.json({ error: 'accountId query param required' }, { status: 400 })
    }

    // Verify ownership
    const { data: account } = await supabase
      .from('trading_accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 403 })
    }

    // Revoke by removing or updating status to REVOKED with an invalidated hash
    const { error: revokeError } = await supabase
      .from('integrations')
      .update({
        bridge_token_hash: 'REVOKED_' + Date.now(),
        status: 'DISCONNECTED',
        updated_at: new Date().toISOString(),
      })
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .eq('provider', provider)

    if (revokeError) {
      return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Integration token revoked successfully.',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
