import crypto from 'crypto'

/**
 * Retrieves the cryptographic webhook secret from the server environment.
 * FAILS CLOSED if BRIDGE_WEBHOOK_SECRET is missing or insufficiently random (< 32 chars).
 */
export function getBridgeSecret(): string {
  const secret = process.env.BRIDGE_WEBHOOK_SECRET
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      'Security Configuration Failure: BRIDGE_WEBHOOK_SECRET must be configured with at least 32 characters. Server fails closed.'
    )
  }
  return secret.trim()
}

/**
 * Validates whether the raw token has a valid format and prefix.
 */
export function isValidTokenFormat(rawToken: string | null | undefined): boolean {
  if (!rawToken || typeof rawToken !== 'string') return false
  const trimmed = rawToken.trim()
  return trimmed.startsWith('klj_live_') && trimmed.length >= 48
}

/**
 * Generates a high-entropy, cryptographically secure bridge token for MT4/MT5 EAs.
 */
export function generateBridgeToken(): { rawToken: string; tokenHash: string } {
  // Fail closed if server secret is missing
  getBridgeSecret()

  const randomBytes = crypto.randomBytes(32).toString('hex')
  const rawToken = `klj_live_${randomBytes}`
  const tokenHash = hashBridgeToken(rawToken)
  return { rawToken, tokenHash }
}

/**
 * Generates a SHA-256 HMAC hash of a bridge token for database lookup.
 * We never store plaintext tokens in the database.
 */
export function hashBridgeToken(rawToken: string): string {
  const secret = getBridgeSecret()
  return crypto.createHmac('sha256', secret).update(rawToken.trim()).digest('hex')
}

// In-Memory Token Bucket Rate Limiter for Webhook endpoints (prevents spam and denial of service)
interface RateLimitBucket {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitBucket>()

/**
 * Checks rate limits (e.g., max 60 requests per minute per IP / token).
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const bucket = rateLimitMap.get(key)

  if (!bucket || now > bucket.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (bucket.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  bucket.count++
  return { allowed: true, remaining: maxRequests - bucket.count }
}

// In-Memory Idempotency cache (prevents duplicate execution processing within 10 minutes)
const idempotencyCache = new Set<string>()

export function isDuplicateRequest(idempotencyKey: string): boolean {
  if (idempotencyCache.has(idempotencyKey)) {
    return true
  }
  idempotencyCache.add(idempotencyKey)
  setTimeout(() => idempotencyCache.delete(idempotencyKey), 10 * 60 * 1000)
  return false
}
