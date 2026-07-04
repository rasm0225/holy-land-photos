/**
 * Shared in-memory sliding-window rate limiter.
 *
 * Resets on process restart, which is fine — the goal is to slow down
 * obvious flooders (scripted loops draining an API budget), not to be
 * airtight. Per-IP only; an attacker rotating IPs can still get through,
 * but the nginx bot/geo blocklists filter most of that traffic first.
 *
 * The feedback route has its own copy of this pattern predating this
 * module; leaving it untouched to keep changes focused.
 */

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

/**
 * Returns a function `isRateLimited(ip)` that records a hit and reports
 * whether the caller has exceeded `max` requests within `windowMs`.
 */
export function makeRateLimiter({
  windowMs,
  max,
}: {
  windowMs: number
  max: number
}): (ip: string) => boolean {
  const recent = new Map<string, number[]>()

  return function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const cutoff = now - windowMs
    const hits = (recent.get(ip) || []).filter((t) => t > cutoff)
    if (hits.length >= max) {
      recent.set(ip, hits)
      return true
    }
    hits.push(now)
    recent.set(ip, hits)
    // Periodic cleanup: when the map grows past 1k entries, drop empty ones.
    if (recent.size > 1000) {
      for (const [k, v] of recent) {
        if (v.every((t) => t <= cutoff)) recent.delete(k)
      }
    }
    return false
  }
}
