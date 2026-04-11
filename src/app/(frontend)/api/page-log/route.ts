import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Payload = {
  url?: unknown
  title?: unknown
  duration?: unknown
  ttfb?: unknown
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload

    const url = typeof body.url === 'string' ? body.url.slice(0, 500) : ''
    const title = typeof body.title === 'string' ? body.title.slice(0, 300) : ''
    const duration = Number(body.duration)
    const ttfb = Number(body.ttfb)

    // Basic sanity checks — ignore junk/bot traffic
    if (!url) return NextResponse.json({ ok: false }, { status: 400 })
    if (!Number.isFinite(duration) || duration < 0 || duration > 300000) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    // Don't log admin pages
    if (url.startsWith('/admin')) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const dbUrl = (process.env.DATABASE_URL || '').replace('libsql://', 'https://') + '/v2/pipeline'
    const token = process.env.DATABASE_AUTH_TOKEN || ''
    if (!dbUrl || !token) {
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    await fetch(dbUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql: `INSERT INTO page_logs (url, title, duration_ms, ttfb_ms) VALUES (?, ?, ?, ?)`,
              args: [
                { type: 'text', value: url },
                { type: 'text', value: title },
                { type: 'integer', value: String(Math.round(duration)) },
                Number.isFinite(ttfb) && ttfb >= 0
                  ? { type: 'integer', value: String(Math.round(ttfb)) }
                  : { type: 'null', value: null },
              ],
            },
          },
          { type: 'close' },
        ],
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('page-log error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
