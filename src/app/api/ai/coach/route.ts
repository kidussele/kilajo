import { NextRequest, NextResponse } from 'next/server'
import { callGeminiApi, TRADING_COACH_SYSTEM_PROMPT } from '@/lib/ai/gemini-client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, trade, trades, summary, userMessage, history, apiKey } = body

    if (action === 'audit-mistakes') {
      const tradesSample = Array.isArray(trades) ? trades.slice(0, 30) : []
      const prompt = `
Analyze my overall trading performance and tell me ALL my mistakes, blindspots, and bad habits.

PORTFOLIO PERFORMANCE SUMMARY:
- Total Executions: ${summary?.totalTrades ?? tradesSample.length}
- Win Rate: ${summary?.winRate ?? 0}%
- Realized Net P&L: $${summary?.netPnl ?? 0}
- Profit Factor: ${summary?.profitFactor ?? 0}
- Max Drawdown: $${summary?.maxDrawdown ?? 0}
- Average Win: $${summary?.avgWin ?? 0} | Average Loss: $${summary?.avgLoss ?? 0}

RECENT TRADES RECORD (Last ${tradesSample.length}):
${JSON.stringify(
  tradesSample.map((t: any) => ({
    symbol: t.symbol,
    direction: t.direction,
    quantity: t.quantity,
    entry: t.entry_price,
    exit: t.exit_price,
    netPnl: t.net_pnl,
    stopLoss: t.stop_loss || 'None',
    takeProfit: t.take_profit || 'None',
    entryTime: t.entry_time,
    exitTime: t.exit_time,
    mistakeNote: t.mistakes || 'None',
    emotionBefore: t.emotion_before || 'Not logged',
    emotionAfter: t.emotion_after || 'Not logged',
  })),
  null,
  2
)}

Please structure your response with:
1. 🩺 **Executive Mistake Diagnosis**: What is the #1 flaw costing me money?
2. ⚠️ **Top 4 Critical Mistakes Found**: List specific mistakes with evidence from the data (e.g. lack of stops, oversized lots, revenge frequency, trading off-hours).
3. 🧠 **Psychology & Emotional Leak Audit**: Identify tilt, greed, or fear patterns.
4. 👨‍🏫 **Teacher's 3-Step Homework Plan**: 3 concrete non-negotiable rules for my next trading week.
`
      const response = await callGeminiApi(prompt, TRADING_COACH_SYSTEM_PROMPT, apiKey)
      return NextResponse.json({ success: true, analysis: response })
    }

    if (action === 'analyze-single-trade') {
      if (!trade) {
        return NextResponse.json({ error: 'Trade data is required' }, { status: 400 })
      }

      const prompt = `
Analyze this specific executed trade in detail and tell me my mistakes, execution quality, and what I should have done differently.

TRADE DETAILS:
- Symbol: ${trade.symbol}
- Direction: ${trade.direction}
- Lot Size: ${trade.quantity}
- Entry Price: ${trade.entry_price}
- Exit Price: ${trade.exit_price || 'Still Open'}
- Stop Loss: ${trade.stop_loss || 'NO STOP LOSS SET'}
- Take Profit: ${trade.take_profit || 'Not set'}
- Realized Net P&L: $${trade.net_pnl}
- Entry Timestamp: ${trade.entry_time}
- Exit Timestamp: ${trade.exit_time || 'Open'}
- Logged Mistakes: ${trade.mistakes || 'None specified'}
- Trader Notes: ${trade.notes || 'None'}
- Pre-Trade Emotion: ${trade.emotion_before || 'None'}
- Post-Trade Emotion: ${trade.emotion_after || 'None'}

Please provide:
1. 🎯 **Execution Score**: (1 to 10 rating based on risk control and setup quality)
2. 🚨 **Specific Mistakes on this Trade**: Was there proper risk defined? Was the exit rushed or overheld?
3. 💡 **Teacher Lesson**: What is the core rule this trade teaches for future setups?
`
      const response = await callGeminiApi(prompt, TRADING_COACH_SYSTEM_PROMPT, apiKey)
      return NextResponse.json({ success: true, analysis: response })
    }

    if (action === 'chat') {
      const conversationHistory = Array.isArray(history)
        ? history
            .map((h: any) => `${h.role === 'user' ? 'Trader' : 'AI Coach'}: ${h.content}`)
            .join('\n\n')
        : ''

      const contextStats = summary
        ? `[Current Trader Stats: Total Trades: ${summary.totalTrades}, Win Rate: ${summary.winRate}%, Net P&L: $${summary.netPnl}, Max Drawdown: $${summary.maxDrawdown}]`
        : ''

      const prompt = `
${contextStats}

CONVERSATION HISTORY:
${conversationHistory}

TRADER NEW QUESTION/REQUEST:
${userMessage}

Respond as the KILAJO Universal AI Trading Coach & Teacher Helper. Be insightful, concise, actionable, and focus on helping the trader avoid common psychological and technical mistakes.
`
      const response = await callGeminiApi(prompt, TRADING_COACH_SYSTEM_PROMPT, apiKey)
      return NextResponse.json({ success: true, reply: response })
    }

    return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 })
  } catch (error: any) {
    console.error('AI Coach API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to process AI assistant request.',
      },
      { status: 500 }
    )
  }
}

