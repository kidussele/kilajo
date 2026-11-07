import { NextRequest, NextResponse } from 'next/server'
import { MetaTrader5Adapter } from '@/lib/adapters/mt5-adapter'

/**
 * Universal MT4 / MT5 Webhook Endpoint
 * Receives deal executions from the read-only KILAJO Expert Advisor.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Bearer token' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    if (!token || token.length < 16) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid bridge token length' },
        { status: 401 }
      )
    }

    const body = await req.json()
    if (!body || (!body.deals && !body.ticket && !body.symbol)) {
      return NextResponse.json(
        { error: 'Invalid payload: No recognizable MT5 deal or position structure' },
        { status: 400 }
      )
    }

    const adapter = new MetaTrader5Adapter()
    const rawRecords = Array.isArray(body.deals) ? body.deals : [body]
    const normalizedResult = adapter.normalize(rawRecords)

    return NextResponse.json({
      success: true,
      recordsReceived: rawRecords.length,
      tradesNormalized: normalizedResult.validRows,
      trades: normalizedResult.trades,
      message: 'Deal executions received and validated successfully.',
    })
  } catch (error: any) {
    console.error('MT5 Webhook Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error processing MT5 webhook', details: error.message },
      { status: 500 }
    )
  }
}
