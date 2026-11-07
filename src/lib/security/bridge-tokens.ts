import crypto from 'crypto'

const BRIDGE_SECRET = process.env.BRIDGE_WEBHOOK_SECRET || 'kilajo_bridge_secret_salt_v1_secure_key'

/**
 * Generates a high-entropy, cryptographically secure bridge token for MT4/MT5 EAs.
 */
export function generateBridgeToken(): { rawToken: string; tokenHash: string } {
  const randomPart = crypto.randomBytes(24).toString('hex')
  const rawToken = `klj_live_${randomPart}`
  const tokenHash = hashBridgeToken(rawToken)
  return { rawToken, tokenHash }
}

/**
 * Generates a SHA-256 HMAC hash of a bridge token for database lookup.
 * We never store raw tokens in the database.
 */
export function hashBridgeToken(rawToken: string): string {
  return crypto.createHmac('sha256', BRIDGE_SECRET).update(rawToken.trim()).digest('hex')
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
export function checkRateLimit(key: string, maxRequests: number = 60, windowMs: number = 60000): { allowed: boolean; remaining: number } {
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

// In-Memory Idempotency cache (prevents duplicate execution processing within 5 minutes)
const idempotencyCache = new Set<string>()

export function isDuplicateRequest(idempotencyKey: string): boolean {
  if (idempotencyCache.has(idempotencyKey)) {
    return true
  }
  idempotencyCache.add(idempotencyKey)
  // Prune after 10 minutes
  setTimeout(() => idempotencyCache.delete(idempotencyKey), 10 * 60 * 1000)
  return false
}
