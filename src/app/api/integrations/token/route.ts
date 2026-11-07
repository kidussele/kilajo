import { NextRequest, NextResponse } from 'next/server'
import { generateBridgeToken } from '@/lib/security/bridge-tokens'
import { createClient } from '@/lib/supabase/server'

/**
 * Generates and securely registers a cryptographic bridge token for an account.
 * Only the SHA-256 HMAC hash is stored in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { accountId } = body

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
    }

    const { rawToken, tokenHash } = generateBridgeToken()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isSupabaseLive =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')

    if (isSupabaseLive && user) {
      // Upsert integration record with token hash
      await supabase
        .from('integrations')
        .upsert(
          {
            user_id: user.id,
            account_id: accountId,
            provider: 'MT5',
            bridge_token_hash: tokenHash,
            sync_mode: 'READ_ONLY',
            status: 'CONNECTED',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'account_id,provider' }
        )
    }

    return NextResponse.json({
      success: true,
      rawToken, // Sent once to client to display/copy; never stored in plaintext on server
      message: 'Cryptographic bridge token generated and hashed successfully.',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
