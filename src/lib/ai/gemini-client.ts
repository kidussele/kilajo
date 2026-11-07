/**
 * KILAJO AI Trading Assistant & Mentor (Powered by Google Gemini)
 *
 * Dedicated AI Trading Coach, Error/Mistake Analyzer & Teacher Helper.
 * Detects trading flaws (overtrading, revenge trading, bad R:R, sizing mistakes)
 * and provides institutional coaching guidance.
 */

const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash-lite']

export interface TradeSummaryContext {
  totalTrades: number
  winRate: number
  netPnl: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  maxDrawdown: number
  recentTrades?: any[]
}

export interface AiMistakeAnalysis {
  verdict: string
  keyMistakes: string[]
  psychologyAssessment: string
  actionableSteps: string[]
  teacherSummary: string
}

export async function callGeminiApi(
  prompt: string,
  systemInstruction?: string,
  customKey?: string
): Promise<string> {
  const apiKey = customKey || process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.')
  }

  let lastError: Error | null = null

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

      const bodyPayload: any = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const msg = errorData.error?.message || `HTTP ${res.status}`
        throw new Error(`Gemini ${model} error: ${msg}`)
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        return text
      }
    } catch (err: any) {
      lastError = err
      // Try next model if current model has capacity/model availability issue
      continue
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini AI models.')
}

/**
 * System prompt setting the persona of an elite, compassionate institutional trading coach
 */
export const TRADING_COACH_SYSTEM_PROMPT = `
You are the KILAJO Universal AI Trading Coach & Performance Mentor.
Your role is to act as an expert institutional risk officer, psychology teacher, and professional trading mentor.
You analyze trades, find the trader's hidden mistakes, uncover psychological leaks, and teach actionable habits.

Core guidelines:
1. Be direct, compassionate, and brutally honest about mistakes without being discouraging.
2. Focus on the core pillars: Capital Preservation, Risk-to-Reward Ratio (R:R), Session Timing, Emotional Tilt, and Sizing Discipline.
3. Categorize mistakes clearly:
   - RISK MANAGEMENT: Risking too much per trade (>1-2%), lack of hard stop-loss, moving stop-losses away.
   - PSYCHOLOGY: Revenge trading after a loss, overtrading, fear of missing out (FOMO), taking early profits.
   - EXECUTION: Chasing market extremes, trading outside prime market sessions (London/NY), entering without edge.
4. Give concrete "Teacher Guidance" with actionable step-by-step rules to implement tomorrow.
5. Format your answers with clear markdown headers, bullet points, and highlight key metrics.
`

