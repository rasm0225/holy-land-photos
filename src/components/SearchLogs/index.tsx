import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import React from 'react'

type LogRow = {
  id: number
  query: string
  search_type: 'regular' | 'ai'
  result_count: number | null
  duration_ms: number | null
  created_at: string
}

async function queryDB(sql: string): Promise<Array<Array<{ value: string; type: string }>>> {
  const dbUrl = (process.env.DATABASE_URL || '').replace('libsql://', 'https://') + '/v2/pipeline'
  const token = process.env.DATABASE_AUTH_TOKEN || ''
  const res = await fetch(dbUrl, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql } },
        { type: 'close' },
      ],
    }),
  })
  const data = await res.json()
  return data.results?.[0]?.response?.result?.rows || []
}

async function getLogs(): Promise<{
  recent: LogRow[]
  topQueries: Array<{ query: string; count: number; type: 'regular' | 'ai' }>
  zeroResults: Array<{ query: string; count: number }>
  totals: { regular: number; ai: number; total: number }
  dailyCounts: Array<{ day: string; regular: number; ai: number }>
}> {
  const [recentRows, topRegularRows, topAiRows, zeroRows, regularTotal, aiTotal, dailyRows] =
    await Promise.all([
      queryDB(`SELECT id, query, search_type, result_count, duration_ms, created_at FROM search_logs ORDER BY created_at DESC LIMIT 100`),
      queryDB(`SELECT query, COUNT(*) as c FROM search_logs WHERE search_type = 'regular' GROUP BY query ORDER BY c DESC LIMIT 20`),
      queryDB(`SELECT query, COUNT(*) as c FROM search_logs WHERE search_type = 'ai' GROUP BY query ORDER BY c DESC LIMIT 20`),
      queryDB(`SELECT query, COUNT(*) as c FROM search_logs WHERE search_type = 'regular' AND result_count = 0 GROUP BY query ORDER BY c DESC LIMIT 20`),
      queryDB(`SELECT COUNT(*) FROM search_logs WHERE search_type = 'regular'`),
      queryDB(`SELECT COUNT(*) FROM search_logs WHERE search_type = 'ai'`),
      queryDB(`SELECT DATE(created_at) as day, search_type, COUNT(*) as c FROM search_logs WHERE created_at > datetime('now', '-30 days') GROUP BY day, search_type ORDER BY day DESC`),
    ])

  const recent: LogRow[] = recentRows.map((r) => ({
    id: parseInt(r[0].value),
    query: r[1].value,
    search_type: r[2].value as 'regular' | 'ai',
    result_count: r[3].type === 'null' ? null : parseInt(r[3].value),
    duration_ms: r[4].type === 'null' ? null : parseInt(r[4].value),
    created_at: r[5].value,
  }))

  const topRegular = topRegularRows.map((r) => ({ query: r[0].value, count: parseInt(r[1].value), type: 'regular' as const }))
  const topAi = topAiRows.map((r) => ({ query: r[0].value, count: parseInt(r[1].value), type: 'ai' as const }))
  const topQueries = [...topRegular, ...topAi].sort((a, b) => b.count - a.count)

  const zeroResults = zeroRows.map((r) => ({ query: r[0].value, count: parseInt(r[1].value) }))

  const totals = {
    regular: parseInt(regularTotal[0]?.[0]?.value || '0'),
    ai: parseInt(aiTotal[0]?.[0]?.value || '0'),
    total: 0,
  }
  totals.total = totals.regular + totals.ai

  // Aggregate daily counts by day
  const dailyMap: Record<string, { regular: number; ai: number }> = {}
  for (const r of dailyRows) {
    const day = r[0].value
    const type = r[1].value as 'regular' | 'ai'
    const c = parseInt(r[2].value)
    if (!dailyMap[day]) dailyMap[day] = { regular: 0, ai: 0 }
    dailyMap[day][type] = c
  }
  const dailyCounts = Object.entries(dailyMap)
    .map(([day, counts]) => ({ day, ...counts }))
    .sort((a, b) => b.day.localeCompare(a.day))

  return { recent, topQueries, zeroResults, totals, dailyCounts }
}

export default async function SearchLogsView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
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
          Search Logs
        </h1>
        <p style={{ marginBottom: 32, color: 'var(--theme-elevation-500)', fontSize: 14 }}>
          Anonymous search activity. Queries, result counts, and timestamps only — no user identifiers.
        </p>

        {/* Totals */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <StatCard label="Total searches" value={data.totals.total} />
          <StatCard label="Regular searches" value={data.totals.regular} />
          <StatCard label="AI searches" value={data.totals.ai} />
        </div>

        {/* Two column layout for top queries */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Top queries</h2>
            {data.topQueries.length === 0 ? (
              <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>No searches yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--theme-elevation-200)' }}>
                    <th style={cellStyle}>Query</th>
                    <th style={cellStyle}>Type</th>
                    <th style={{ ...cellStyle, textAlign: 'right' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topQueries.slice(0, 20).map((q, i) => (
                    <tr key={i}>
                      <td style={cellStyle}>{q.query}</td>
                      <td style={cellStyle}>
                        <span style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: q.type === 'ai' ? '#e6f0ff' : '#f0f0f0',
                          color: q.type === 'ai' ? '#0066cc' : '#555',
                        }}>
                          {q.type}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>{q.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Zero-result queries</h2>
            <p style={{ color: 'var(--theme-elevation-500)', fontSize: 12, marginBottom: 12 }}>
              Regular searches that returned nothing — useful for finding gaps in the archive.
            </p>
            {data.zeroResults.length === 0 ? (
              <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>None yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--theme-elevation-200)' }}>
                    <th style={cellStyle}>Query</th>
                    <th style={{ ...cellStyle, textAlign: 'right' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.zeroResults.map((q, i) => (
                    <tr key={i}>
                      <td style={cellStyle}>{q.query}</td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>{q.count}</td>
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
                  <th style={{ ...cellStyle, textAlign: 'right' }}>Regular</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>AI</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyCounts.map((d) => (
                  <tr key={d.day}>
                    <td style={cellStyle}>{d.day}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{d.regular}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{d.ai}</td>
                    <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600 }}>{d.regular + d.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent searches */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Recent searches (last 100)</h2>
          {data.recent.length === 0 ? (
            <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>No searches yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--theme-elevation-200)' }}>
                  <th style={cellStyle}>Time</th>
                  <th style={cellStyle}>Query</th>
                  <th style={cellStyle}>Type</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>Results</th>
                  <th style={{ ...cellStyle, textAlign: 'right' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r) => (
                  <tr key={r.id}>
                    <td style={cellStyle}>{formatTime(r.created_at)}</td>
                    <td style={cellStyle}>{r.query}</td>
                    <td style={cellStyle}>
                      <span style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: r.search_type === 'ai' ? '#e6f0ff' : '#f0f0f0',
                        color: r.search_type === 'ai' ? '#0066cc' : '#555',
                      }}>
                        {r.search_type}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      {r.result_count != null ? r.result_count : '—'}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right', color: 'var(--theme-elevation-500)' }}>
                      {r.duration_ms != null ? `${r.duration_ms}ms` : '—'}
                    </td>
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

function StatCard({ label, value }: { label: string; value: number }) {
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
        {value.toLocaleString()}
      </div>
    </div>
  )
}
