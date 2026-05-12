import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import React from 'react'
import { dbQuery } from '@/lib/db'

type LogRow = {
  id: number
  url: string
  title: string | null
  duration_ms: number | null
  ttfb_ms: number | null
  created_at: string
}

async function getLogs(): Promise<{
  recent: LogRow[]
  topPages: Array<{ url: string; title: string | null; count: number; avg: number; p95: number }>
  slowest: LogRow[]
  totals: { total: number; avgDuration: number; medianDuration: number }
  dailyCounts: Array<{ day: string; count: number; avg: number }>
}> {
  const [recentRows, slowestRows, topRows, dailyRows, allDurationRows] = await Promise.all([
    dbQuery(`SELECT id, url, title, duration_ms, ttfb_ms, created_at FROM page_logs ORDER BY created_at DESC LIMIT 100`),
    dbQuery(`SELECT id, url, title, duration_ms, ttfb_ms, created_at FROM page_logs WHERE duration_ms IS NOT NULL ORDER BY duration_ms DESC LIMIT 20`),
    dbQuery(`SELECT url, title, COUNT(*) as c, AVG(duration_ms) as avg FROM page_logs WHERE duration_ms IS NOT NULL GROUP BY url ORDER BY c DESC LIMIT 20`),
    dbQuery(`SELECT DATE(created_at) as day, COUNT(*) as c, AVG(duration_ms) as avg FROM page_logs WHERE created_at > datetime('now', '-30 days') GROUP BY day ORDER BY day DESC`),
    dbQuery(`SELECT duration_ms FROM page_logs WHERE duration_ms IS NOT NULL ORDER BY duration_ms`),
  ])

  const parseRow = (r: Record<string, unknown>): LogRow => ({
    id: Number(r.id),
    url: String(r.url),
    title: r.title != null ? String(r.title) : null,
    duration_ms: r.duration_ms != null ? Number(r.duration_ms) : null,
    ttfb_ms: r.ttfb_ms != null ? Number(r.ttfb_ms) : null,
    created_at: String(r.created_at),
  })

  const recent = recentRows.map(parseRow)
  const slowest = slowestRows.map(parseRow)

  const topPages = topRows.map((r) => ({
    url: String(r.url),
    title: r.title != null ? String(r.title) : null,
    count: Number(r.c),
    avg: Math.round(Number(r.avg)),
    p95: 0,
  }))

  // Compute p95 per URL
  for (const page of topPages) {
    const durations = await dbQuery(
      `SELECT duration_ms FROM page_logs WHERE url = '${page.url.replace(/'/g, "''")}' AND duration_ms IS NOT NULL ORDER BY duration_ms`,
    )
    const list = durations.map((r) => Number(r.duration_ms)).filter((n) => Number.isFinite(n))
    if (list.length > 0) {
      const idx = Math.min(list.length - 1, Math.floor(list.length * 0.95))
      page.p95 = list[idx]
    }
  }

  const all = allDurationRows.map((r) => Number(r.duration_ms)).filter((n) => Number.isFinite(n))
  const total = all.length
  const avgDuration = total > 0 ? Math.round(all.reduce((a, b) => a + b, 0) / total) : 0
  const medianDuration = total > 0 ? all[Math.floor(total / 2)] : 0

  const dailyCounts = dailyRows.map((r) => ({
    day: String(r.day),
    count: Number(r.c),
    avg: Math.round(Number(r.avg)),
  }))

  return {
    recent,
    topPages,
    slowest,
    totals: { total, avgDuration, medianDuration },
    dailyCounts,
  }
}

export default async function PageLogsView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props

  if (!initPageResult.req.user) {
    redirect('/admin/login')
  }

  const data = await getLogs()

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  const formatMs = (ms: number | null) => {
    if (ms == null) return '—'
    if (ms < 1000) return `${ms} ms`
    return `${(ms / 1000).toFixed(2)} s`
  }

  const cellStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid var(--theme-elevation-100)',
    fontSize: 13,
    verticalAlign: 'top',
  }

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div style={{ padding: '40px', maxWidth: '1200px', fontFamily: 'var(--font-body)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--theme-elevation-1000)' }}>
          Page Load Times
        </h1>
        <p style={{ marginBottom: 32, color: 'var(--theme-elevation-500)', fontSize: 14 }}>
          Anonymous page load performance, measured in the browser. No user identifiers. Admin pages are excluded.
        </p>

        {/* Totals */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <StatCard label="Total page loads" value={data.totals.total.toLocaleString()} />
          <StatCard label="Average duration" value={formatMs(data.totals.avgDuration)} />
          <StatCard label="Median duration" value={formatMs(data.totals.medianDuration)} />
        </div>

        {/* Top pages + Slowest loads */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Most visited</h2>
            {data.topPages.length === 0 ? (
              <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>No data yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--theme-elevation-200)' }}>
                    <th style={cellStyle}>URL</th>
                    <th style={{ ...cellStyle, textAlign: 'right' }}>Views</th>
                    <th style={{ ...cellStyle, textAlign: 'right' }}>Avg</th>
                    <th style={{ ...cellStyle, textAlign: 'right' }}>p95</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((p, i) => (
                    <tr key={i}>
                      <td style={cellStyle}>
                        <div style={{ fontSize: 12, fontFamily: 'monospace' }}>{p.url}</div>
                        {p.title && (
                          <div style={{ fontSize: 11, color: 'var(--theme-elevation-500)' }}>{p.title}</div>
                        )}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>{p.count}</td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>{formatMs(p.avg)}</td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>{formatMs(p.p95)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Slowest page loads</h2>
            <p style={{ color: 'var(--theme-elevation-500)', fontSize: 12, marginBottom: 12 }}>
              Individual loads sorted by duration — useful for spotting outliers.
            </p>
            {data.slowest.length === 0 ? (
              <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>No data yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--theme-elevation-200)' }}>
                    <th style={cellStyle}>URL</th>
                    <th style={{ ...cellStyle, textAlign: 'right' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slowest.map((r) => (
                    <tr key={r.id}>
                      <td style={cellStyle}>
                        <div style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.url}</div>
                        <div style={{ fontSize: 11, color: 'var(--theme-elevation-500)' }}>{formatTime(r.created_at)}</div>
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600 }}>
                        {formatMs(r.duration_ms)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Daily activity */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Last 30 days</h2>
          {data.dailyCounts.length === 0 ? (
            <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>No activity yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: 500 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--theme-elevation-200)' }}>
                  <th style={cellStyle}>Day</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>Loads</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>Avg</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyCounts.map((d) => (
                  <tr key={d.day}>
                    <td style={cellStyle}>{d.day}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{d.count}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{formatMs(d.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Recent page loads (last 100)</h2>
          {data.recent.length === 0 ? (
            <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>No data yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--theme-elevation-200)' }}>
                  <th style={cellStyle}>Time</th>
                  <th style={cellStyle}>URL</th>
                  <th style={cellStyle}>Title</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>TTFB</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r) => (
                  <tr key={r.id}>
                    <td style={cellStyle}>{formatTime(r.created_at)}</td>
                    <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 12 }}>{r.url}</td>
                    <td style={cellStyle}>{r.title || '—'}</td>
                    <td style={{ ...cellStyle, textAlign: 'right', color: 'var(--theme-elevation-500)' }}>
                      {formatMs(r.ttfb_ms)}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{formatMs(r.duration_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DefaultTemplate>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      padding: '16px 24px',
      border: '1px solid var(--theme-elevation-200)',
      borderRadius: 4,
      minWidth: 160,
    }}>
      <div style={{ fontSize: 12, color: 'var(--theme-elevation-500)', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--theme-elevation-1000)' }}>
        {value}
      </div>
    </div>
  )
}
