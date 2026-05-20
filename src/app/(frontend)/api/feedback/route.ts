import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'

// In-memory sliding-window rate limit. Resets on process restart, which is
// fine — the goal is to slow down obvious flooders, not to be airtight.
// 3 submissions per IP per hour.
const RATE_WINDOW_MS = 60 * 60 * 1000
const RATE_MAX = 3
const recent = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const cutoff = now - RATE_WINDOW_MS
  const hits = (recent.get(ip) || []).filter((t) => t > cutoff)
  if (hits.length >= RATE_MAX) {
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

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: unknown
      email?: unknown
      subject?: unknown
      message?: unknown
      website?: unknown // honeypot
    }

    // Honeypot: real users never fill the hidden `website` field.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      // Pretend it worked so bots don't learn to retry.
      return NextResponse.json({ ok: true })
    }

    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : ''
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : ''
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : ''

    if (!name) return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400 })
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { ok: false, error: 'A valid email address is required.' },
        { status: 400 },
      )
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: 'Message is required.' }, { status: 400 })
    }

    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many submissions from this IP — try again later.' },
        { status: 429 },
      )
    }

    const payload = await getPayload({ config })
    await payload.create({
      collection: 'feedback',
      data: {
        name,
        email,
        subject: subject || undefined,
        message,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent')?.slice(0, 500) || undefined,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Feedback error:', err)
    return NextResponse.json(
      { ok: false, error: 'Server error. Please try again.' },
      { status: 500 },
    )
  }
}
